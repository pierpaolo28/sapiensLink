output "service_discovery_service_arn" {
  value = one(aws_service_discovery_service.ecs_discovery_service[*].arn)
}