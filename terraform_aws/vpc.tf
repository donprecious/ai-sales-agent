# --- VPC Configuration ---

# Retrieve the availability zones for the current AWS region
data "aws_availability_zones" "available" {
  state = "available"
}

# Create the Virtual Private Cloud (VPC)
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(
    local.common_tags,
    {
      Name = "${var.project_name}-vpc"
    }
  )
}

# --- Internet Gateway ---

# Create an Internet Gateway for the VPC to allow communication with the internet
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    local.common_tags,
    {
      Name = "${var.project_name}-igw"
    }
  )
}

# --- Public Subnets ---

# Create public subnets in different Availability Zones
resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index % length(data.aws_availability_zones.available.names)] # Distribute across AZs
  map_public_ip_on_launch = true                                                                                                           # Instances in public subnets get public IPs

  tags = merge(
    local.common_tags,
    {
      Name                                      = "${var.project_name}-public-subnet-${count.index + 1}"
      "kubernetes.io/cluster/${local.eks_cluster_name}" = "shared" # Tag for EKS auto-discovery
      "kubernetes.io/role/elb"                  = "1"      # Tag for public-facing load balancers
    }
  )
}

# --- Elastic IPs and NAT Gateways ---
# Create one EIP and NAT Gateway per public subnet/AZ for resiliency.
# Assuming the number of public subnets corresponds to the number of AZs we want NAT gateways in.

resource "aws_eip" "nat" {
  count = length(aws_subnet.public) # Create an EIP for each public subnet intended for a NAT Gateway
  domain   = "vpc"                  # Changed from 'vpc = true' to 'domain = "vpc"' for newer provider versions

  tags = merge(
    local.common_tags,
    {
      Name = "${var.project_name}-nat-eip-${count.index + 1}"
    }
  )
  depends_on = [aws_internet_gateway.gw] # Ensure IGW is created before EIP
}

resource "aws_nat_gateway" "nat" {
  count         = length(aws_subnet.public) # Create a NAT Gateway in each public subnet
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = merge(
    local.common_tags,
    {
      Name = "${var.project_name}-nat-gw-${count.index + 1}"
    }
  )
  depends_on = [aws_internet_gateway.gw] # Ensure IGW is created before NAT Gateway
}

# --- Private Subnets ---

# Create private subnets in different Availability Zones
resource "aws_subnet" "private" {
  count                   = length(var.private_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.private_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index % length(data.aws_availability_zones.available.names)] # Distribute across AZs
  map_public_ip_on_launch = false                                                                                                          # Instances in private subnets do not get public IPs

  tags = merge(
    local.common_tags,
    {
      Name                                      = "${var.project_name}-private-subnet-${count.index + 1}"
      "kubernetes.io/cluster/${local.eks_cluster_name}" = "shared" # Tag for EKS auto-discovery
      "kubernetes.io/role/internal-elb"         = "1"      # Tag for internal load balancers
    }
  )
}

# --- Route Tables ---

# Public Route Table: Routes traffic to the Internet Gateway
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${var.project_name}-public-rt"
    }
  )
}

# Associate public subnets with the public route table
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Private Route Tables: Route traffic to NAT Gateways
# Create one route table per private subnet/AZ for routing to the corresponding NAT Gateway
resource "aws_route_table" "private" {
  count  = length(aws_subnet.private)
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat[count.index % length(aws_nat_gateway.nat)].id # Route to corresponding NAT GW in the same AZ
  }

  tags = merge(
    local.common_tags,
    {
      Name = "${var.project_name}-private-rt-${count.index + 1}"
    }
  )
}

# Associate private subnets with their respective private route tables
resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}