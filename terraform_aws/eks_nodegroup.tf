# --- EKS Managed Node Group ---

resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-ng"
  node_role_arn   = aws_iam_role.eks_node_role.arn # Using the role directly
  # If using instance profile: node_role_arn = aws_iam_instance_profile.eks_node_instance_profile.arn
  subnet_ids      = aws_subnet.private[*].id # Worker nodes typically run in private subnets

  # Specify instance types for the worker nodes
  instance_types = var.eks_node_instance_types

  # Configure scaling for the node group
  scaling_config {
    desired_size = 2
    min_size     = 1
    max_size     = 3
  }

  # AMI type - AL2_x86_64 is common, can be changed based on needs (e.g., ARM, GPU)
  ami_type = "AL2_x86_64"
  # release_version = "1.29.0-20240129" # Optional: Pin to a specific EKS optimized AMI version, otherwise uses latest for K8s version
  # capacity_type = "ON_DEMAND" # Or "SPOT"

  # Ensure the EKS cluster and IAM role (and instance profile if used) are created first
  depends_on = [
    aws_eks_cluster.main,
    aws_iam_role.eks_node_role,
    aws_iam_instance_profile.eks_node_instance_profile # Important if instance profile is used by nodes
  ]

  tags = merge(
    local.common_tags,
    {
      Name                                              = "${var.project_name}-node-group"
      "k8s.io/cluster-autoscaler/enabled"               = "true" # Tag for cluster autoscaler if used
      "k8s.io/cluster-autoscaler/${local.eks_cluster_name}" = "owned"  # Tag for cluster autoscaler
    }
  )

  # Update policy for node group updates
  update_config {
    max_unavailable = 1 # Or max_unavailable_percentage
  }

  # Optional: Remote access configuration (e.g., for SSH)
  # remote_access {
  #   ec2_ssh_key = "your-ec2-ssh-key-name" # Replace with your EC2 key pair name if SSH access is needed
  #   source_security_group_ids = [aws_security_group.node_ssh_access.id] # Example security group
  # }

  # It's good practice to explicitly define labels for nodes if needed
  # labels = {
  #   "role" = "application-nodes"
  # }

  # Taints can be applied to nodes to restrict scheduling
  # taints = [
  #   {
  #     key    = "dedicated"
  #     value  = "gpuInstance"
  #     effect = "NO_SCHEDULE"
  #   }
  # ]
}

# Example Security Group for SSH access to nodes (if remote_access is configured)
# resource "aws_security_group" "node_ssh_access" {
#   name        = "${var.project_name}-node-ssh-access"
#   description = "Allow SSH access to EKS worker nodes from specific IPs"
#   vpc_id      = aws_vpc.main.id
#
#   ingress {
#     from_port   = 22
#     to_port     = 22
#     protocol    = "tcp"
#     cidr_blocks = ["YOUR_IP_ADDRESS/32"] # Replace with your IP or a bastion SG
#   }
#
#   tags = merge(
#     local.common_tags,
#     {
#       Name = "${var.project_name}-node-ssh-sg"
#     }
#   )
# }