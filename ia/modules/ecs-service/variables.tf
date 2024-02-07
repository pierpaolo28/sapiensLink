variable "name" {
  type        = string
  description = "(Required) Name of the service (up to 255 letters, numbers, hyphens, and underscores)"
}

variable "capacity_provider_name" {
  type        = string
  description = "(Required) Capacity Provider Name (up to 255 letters, numbers, hyphens, and underscores)"
}

variable "cluster_arn" {
  type        = string
  default     = null
  description = "(Optional) ARN of an ECS cluster."
}

variable "task_definition_arn" {
  type        = string
  default     = null
  description = "(Optional) ARN of Task Definition."
}

variable "desired_count" {
  type        = number
  default     = 0
  description = "(Optional) Number of instances of the task definition to place and keep running. Defaults to 0."
}

variable "load_balancer" {
  type = object({
    target_group_arn = string
    container_name   = string
    container_port   = number
  })
  default     = null
  description = "(Optional) Configuration block for load balancers.<br />target_group_arn - (Required for ALB/NLB) ARN of the Load Balancer target group to associate with the service.<br />(Required) Name of the container to associate with the load balancer (as it appears in a container definition).<br />(Required) Port on the container to associate with the load balancer."
}

variable "network_configuration" {
  type = object({
    subnets          = set(string)
    security_groups  = optional(set(string))
    assign_public_ip = optional(bool)
  })
  default     = null
  description = "Network configuration for the service. This parameter is required for task definitions that use the awsvpc network mode to receive their own Elastic Network Interface, and it is not supported for other network modes.<br />subnets - (Required) Subnets associated with the task or service.<br />security_groups - (Optional) Security groups associated with the task or service. If you do not specify a security group, the default security group for the VPC is used.<br />assign_public_ip - (Optional) Assign a public IP address to the ENI (Fargate launch type only). Valid values are true or false. Default false."
}

variable "health_check_grace_period_seconds" {
  type        = number
  default     = null
  description = "(Optional) Seconds to ignore failing load balancer health checks on newly instantiated tasks to prevent premature shutdown, up to 2147483647. Only valid for services configured to use load balancers."
}

variable "service_registries" {
  type = object({
    registry_arn   = optional(string)
    port           = optional(number)
    container_port = optional(number)
    container_name = optional(string)
  })
  default     = null
  description = "(Optional) Service discovery registries for the service.<br />(Required) ARN of the Service Registry. The currently supported service registry is Amazon Route 53 Auto Naming Service(aws_service_discovery_service).<br />port - (Optional) Port value used if your Service Discovery service specified an SRV record.<br />container_port - (Optional) Port value, already specified in the task definition, to be used for your service discovery service.<br />container_name - (Optional) Container name value, already specified in the task definition, to be used for your service discovery service."
}

variable "service_discovery_namespace_id" {
  type        = string
  default     = null
  description = "(Optional) Service Discovery Namespace ID"
}

variable "ecr_image_digest" {
  type        = map(any)
  description = "Digest of ECR Image to trigger a new deployment"
}

variable "autoscaling" {
  type = object({
    cluster_name             = string
    min_size                 = number
    max_size                 = number
    additional_alarm_actions = optional(list(string), []) # SNS topic to alert
    metric = object({
      name            = string # https://docs.aws.amazon.com/AmazonECS/latest/developerguide/cloudwatch-metrics.html
      statistic_type  = string
      upper_threshold = number
      lower_threshold = number
    })
    scale_in = object({
      cooldown           = number # Time to wait after a scale_in
      evaluation_periods = number
      interval_period    = number
    })
    scale_out = object({
      cooldown           = number # Time to wait after a scale_out
      evaluation_periods = number
      interval_period    = number
    })
  })
  default     = null
  description = "(Optional) Autoscaling configuration. Default no autoscaling."
}