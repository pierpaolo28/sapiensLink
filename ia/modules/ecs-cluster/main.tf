locals {
  namespace = var.namespace == null ? [] : [var.namespace]
}

resource "aws_ecs_cluster" "cluster" {
  name = var.name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  dynamic "service_connect_defaults" {
    for_each = local.namespace

    content {
      namespace = service_connect_defaults.value
    }
  }
}