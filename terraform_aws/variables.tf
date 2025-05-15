variable "aws_region" {
  description = "The AWS region to deploy resources in."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "A name for the project, used to prefix resource names."
  type        = string
  default     = "sales-rep-ai"
}

variable "vpc_cidr_block" {
  description = "The CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets."
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets."
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24"]
}

variable "eks_cluster_version" {
  description = "Desired Kubernetes version for EKS cluster."
  type        = string
  default     = "1.29"
}

variable "ecr_frontend_repo_name" {
  description = "Name for the frontend ECR repository."
  type        = string
  default     = "frontend"
}

variable "ecr_backend_repo_name" {
  description = "Name for the backend ECR repository."
  type        = string
  default     = "backend"
}

variable "eks_node_instance_types" {
  description = "Instance types for EKS worker nodes."
  type        = list(string)
  default     = ["t3.medium"]
}