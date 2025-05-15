# --- ECR Repositories ---

# ECR Repository for the Frontend Application
resource "aws_ecr_repository" "frontend" {
  name                 = local.ecr_frontend_repository_full_name
  image_tag_mutability = "MUTABLE" # Or "IMMUTABLE" if preferred

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(
    local.common_tags,
    {
      Name = local.ecr_frontend_repository_full_name
    }
  )
}

# ECR Repository for the Backend Application
resource "aws_ecr_repository" "backend" {
  name                 = local.ecr_backend_repository_full_name
  image_tag_mutability = "MUTABLE" # Or "IMMUTABLE" if preferred

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = merge(
    local.common_tags,
    {
      Name = local.ecr_backend_repository_full_name
    }
  )
}