locals {
  # Common tags to be applied to all resources
  common_tags = {
    Project   = var.project_name
    ManagedBy = "Terraform"
  }

  # Derived name for the EKS cluster
  eks_cluster_name = "${var.project_name}-eks-cluster"

  # Derived names for ECR repositories
  ecr_frontend_repository_full_name = "${var.project_name}-${var.ecr_frontend_repo_name}"
  ecr_backend_repository_full_name  = "${var.project_name}-${var.ecr_backend_repo_name}"
}