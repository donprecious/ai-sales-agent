# --- EKS Cluster ---

resource "aws_eks_cluster" "main" {
  name     = local.eks_cluster_name
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = var.eks_cluster_version

  vpc_config {
    # EKS control plane is best placed in private subnets for security.
    # Public subnets are typically used by Load Balancers.
    subnet_ids              = aws_subnet.private[*].id
    endpoint_private_access = true # Keep control plane traffic within the VPC
    endpoint_public_access  = true # Allow kubectl access from public internet (can be restricted)
    # public_access_cidrs = ["0.0.0.0/0"] # Consider restricting access
  }

  # Ensure IAM roles and VPC are created before the cluster
  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_ecr_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_vpc.main
  ]

  tags = merge(
    local.common_tags,
    {
      Name = local.eks_cluster_name
    }
  )

  # Enable specific Kubernetes logging (optional, but recommended)
  enabled_cluster_log_types = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  # It's good practice to manage the VPC CNI add-on explicitly
  # This ensures it's configured correctly and can be updated.
  # Note: The aws_eks_addon resource is preferred for managing add-ons.
}

# --- EKS Add-ons ---

# Manage the VPC CNI add-on for networking within the cluster
resource "aws_eks_addon" "vpc_cni" {
  cluster_name = aws_eks_cluster.main.name
  addon_name   = "vpc-cni"
  # addon_version = "v1.15.4-eksbuild.1" # Specify a version or let AWS manage the default for the K8s version
  # resolve_conflicts_on_create = "OVERWRITE"
  # resolve_conflicts_on_update = "OVERWRITE"

  tags = merge(
    local.common_tags,
    {
      Name        = "${local.eks_cluster_name}-vpc-cni"
      EKS_Addon   = "vpc-cni"
    }
  )
}

# (Optional) Manage CoreDNS add-on
resource "aws_eks_addon" "coredns" {
  cluster_name = aws_eks_cluster.main.name
  addon_name   = "coredns"
  # addon_version = "v1.11.1-eksbuild.9" # Specify a version or let AWS manage the default
  # resolve_conflicts_on_create = "OVERWRITE"
  # resolve_conflicts_on_update = "OVERWRITE"
  tags = merge(
    local.common_tags,
    {
      Name        = "${local.eks_cluster_name}-coredns"
      EKS_Addon   = "coredns"
    }
  )
}

# (Optional) Manage kube-proxy add-on
resource "aws_eks_addon" "kube_proxy" {
  cluster_name = aws_eks_cluster.main.name
  addon_name   = "kube-proxy"
  # addon_version = "v1.29.0-eksbuild.1" # Specify a version or let AWS manage the default
  # resolve_conflicts_on_create = "OVERWRITE"
  # resolve_conflicts_on_update = "OVERWRITE"
  tags = merge(
    local.common_tags,
    {
      Name        = "${local.eks_cluster_name}-kube-proxy"
      EKS_Addon   = "kube-proxy"
    }
  )
}