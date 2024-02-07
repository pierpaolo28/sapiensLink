data "aws_caller_identity" "current" {}

locals {
  load_balancer         = var.load_balancer == null ? [] : [var.load_balancer]
  network_configuration = var.network_configuration == null ? [] : [var.network_configuration]
  service_registries    = var.service_registries == null ? [] : [var.service_registries]
}

resource "aws_ecs_service" "service_autoscaling" {
  count = var.autoscaling == null ? 0 : 1

  name                              = var.name
  cluster                           = var.cluster_arn
  task_definition                   = var.task_definition_arn
  desired_count                     = var.desired_count
  health_check_grace_period_seconds = var.health_check_grace_period_seconds
  force_new_deployment              = true
  propagate_tags                    = "SERVICE"
  wait_for_steady_state             = true

  capacity_provider_strategy {
    base              = 0
    capacity_provider = var.capacity_provider_name
    weight            = 1
  }

  deployment_circuit_breaker {
    enable   = "true"
    rollback = "true"
  }

  deployment_controller {
    type = "ECS"
  }

  ordered_placement_strategy {
    field = "attribute:ecs.availability-zone"
    type  = "spread"
  }
  ordered_placement_strategy {
    field = "instanceId"
    type  = "spread"
  }

  dynamic "load_balancer" {
    for_each = local.load_balancer
    content {
      target_group_arn = load_balancer.value.target_group_arn
      container_name   = load_balancer.value.container_name
      container_port   = load_balancer.value.container_port
    }
  }

  dynamic "network_configuration" {
    for_each = local.network_configuration
    content {
      subnets          = network_configuration.value.subnets
      security_groups  = network_configuration.value.security_groups
      assign_public_ip = network_configuration.value.assign_public_ip
    }
  }

  dynamic "service_registries" {
    for_each = local.service_registries
    content {
      registry_arn   = service_registries.value.port == null ? aws_service_discovery_service.ecs_discovery_service[0].arn : service_registries.value.port
      port           = service_registries.value.port
      container_port = service_registries.value.container_port
      container_name = service_registries.value.container_name
    }
  }

  lifecycle {
    create_before_destroy = true
    ignore_changes        = [desired_count]
  }

  triggers = var.ecr_image_digest

  timeouts {
    create = "30m"
    update = "30m"
    delete = "30m"
  }
}

resource "aws_ecs_service" "service" {
  count = var.autoscaling == null ? 1 : 0

  name                              = var.name
  cluster                           = var.cluster_arn
  task_definition                   = var.task_definition_arn
  desired_count                     = var.desired_count
  health_check_grace_period_seconds = var.health_check_grace_period_seconds
  force_new_deployment              = true
  propagate_tags                    = "SERVICE"
  wait_for_steady_state             = true

  capacity_provider_strategy {
    base              = 0
    capacity_provider = var.capacity_provider_name
    weight            = 1
  }

  deployment_circuit_breaker {
    enable   = "true"
    rollback = "true"
  }

  deployment_controller {
    type = "ECS"
  }

  ordered_placement_strategy {
    field = "attribute:ecs.availability-zone"
    type  = "spread"
  }
  ordered_placement_strategy {
    field = "instanceId"
    type  = "spread"
  }

  dynamic "load_balancer" {
    for_each = local.load_balancer
    content {
      target_group_arn = load_balancer.value.target_group_arn
      container_name   = load_balancer.value.container_name
      container_port   = load_balancer.value.container_port
    }
  }

  dynamic "network_configuration" {
    for_each = local.network_configuration
    content {
      subnets          = network_configuration.value.subnets
      security_groups  = network_configuration.value.security_groups
      assign_public_ip = network_configuration.value.assign_public_ip
    }
  }

  dynamic "service_registries" {
    for_each = local.service_registries
    content {
      registry_arn   = service_registries.value.port == null ? aws_service_discovery_service.ecs_discovery_service[0].arn : service_registries.value.port
      port           = service_registries.value.port
      container_port = service_registries.value.container_port
      container_name = service_registries.value.container_name
    }
  }

  lifecycle {
    create_before_destroy = true
  }

  triggers = var.ecr_image_digest

  timeouts {
    create = "30m"
    update = "30m"
    delete = "30m"
  }
}

resource "aws_service_discovery_service" "ecs_discovery_service" { # rendere opzionale
  count = var.service_discovery_namespace_id == null ? 0 : 1
  name  = var.name

  dns_config {
    namespace_id = var.service_discovery_namespace_id
    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 1
  }
}