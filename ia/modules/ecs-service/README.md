## Description

This module create an ECS Service with all the Best Practice yet applicated.

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Requirements

| Name | Version |
|------|---------|
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | ~> 1.5 |
| <a name="requirement_aws"></a> [aws](#requirement\_aws) | ~> 5.4 |

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | ~> 5.4 |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [aws_appautoscaling_policy.scale_in](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_policy) | resource |
| [aws_appautoscaling_policy.scale_out](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_policy) | resource |
| [aws_appautoscaling_target.this](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/appautoscaling_target) | resource |
| [aws_cloudwatch_metric_alarm.firing](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_metric_alarm) | resource |
| [aws_cloudwatch_metric_alarm.relax](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_metric_alarm) | resource |
| [aws_ecs_service.service](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_service) | resource |
| [aws_ecs_service.service_autoscaling](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ecs_service) | resource |
| [aws_service_discovery_service.ecs_discovery_service](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/service_discovery_service) | resource |
| [aws_caller_identity.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_autoscaling"></a> [autoscaling](#input\_autoscaling) | (Optional) Autoscaling configuration. Default no autoscaling. | <pre>object({<br>    cluster_name             = string<br>    min_size                 = number<br>    max_size                 = number<br>    additional_alarm_actions = optional(list(string), []) # SNS topic to alert<br>    metric = object({<br>      name            = string # https://docs.aws.amazon.com/AmazonECS/latest/developerguide/cloudwatch-metrics.html<br>      statistic_type  = string<br>      upper_threshold = number<br>      lower_threshold = number<br>    })<br>    scale_in = object({<br>      cooldown           = number # Time to wait after a scale_in<br>      evaluation_periods = number<br>      interval_period    = number<br>    })<br>    scale_out = object({<br>      cooldown           = number # Time to wait after a scale_out<br>      evaluation_periods = number<br>      interval_period    = number<br>    })<br>  })</pre> | `null` | no |
| <a name="input_capacity_provider_name"></a> [capacity\_provider\_name](#input\_capacity\_provider\_name) | (Required) Capacity Provider Name (up to 255 letters, numbers, hyphens, and underscores) | `string` | n/a | yes |
| <a name="input_cluster_arn"></a> [cluster\_arn](#input\_cluster\_arn) | (Optional) ARN of an ECS cluster. | `string` | `null` | no |
| <a name="input_desired_count"></a> [desired\_count](#input\_desired\_count) | (Optional) Number of instances of the task definition to place and keep running. Defaults to 0. | `number` | `0` | no |
| <a name="input_ecr_image_digest"></a> [ecr\_image\_digest](#input\_ecr\_image\_digest) | Digest of ECR Image to trigger a new deployment | `map(any)` | n/a | yes |
| <a name="input_health_check_grace_period_seconds"></a> [health\_check\_grace\_period\_seconds](#input\_health\_check\_grace\_period\_seconds) | (Optional) Seconds to ignore failing load balancer health checks on newly instantiated tasks to prevent premature shutdown, up to 2147483647. Only valid for services configured to use load balancers. | `number` | `null` | no |
| <a name="input_load_balancer"></a> [load\_balancer](#input\_load\_balancer) | (Optional) Configuration block for load balancers.<br />target\_group\_arn - (Required for ALB/NLB) ARN of the Load Balancer target group to associate with the service.<br />(Required) Name of the container to associate with the load balancer (as it appears in a container definition).<br />(Required) Port on the container to associate with the load balancer. | <pre>object({<br>    target_group_arn = string<br>    container_name   = string<br>    container_port   = number<br>  })</pre> | `null` | no |
| <a name="input_name"></a> [name](#input\_name) | (Required) Name of the service (up to 255 letters, numbers, hyphens, and underscores) | `string` | n/a | yes |
| <a name="input_network_configuration"></a> [network\_configuration](#input\_network\_configuration) | Network configuration for the service. This parameter is required for task definitions that use the awsvpc network mode to receive their own Elastic Network Interface, and it is not supported for other network modes.<br />subnets - (Required) Subnets associated with the task or service.<br />security\_groups - (Optional) Security groups associated with the task or service. If you do not specify a security group, the default security group for the VPC is used.<br />assign\_public\_ip - (Optional) Assign a public IP address to the ENI (Fargate launch type only). Valid values are true or false. Default false. | <pre>object({<br>    subnets          = set(string)<br>    security_groups  = optional(set(string))<br>    assign_public_ip = optional(bool)<br>  })</pre> | `null` | no |
| <a name="input_service_discovery_namespace_id"></a> [service\_discovery\_namespace\_id](#input\_service\_discovery\_namespace\_id) | (Optional) Service Discovery Namespace ID | `string` | `null` | no |
| <a name="input_service_registries"></a> [service\_registries](#input\_service\_registries) | (Optional) Service discovery registries for the service.<br />(Required) ARN of the Service Registry. The currently supported service registry is Amazon Route 53 Auto Naming Service(aws\_service\_discovery\_service).<br />port - (Optional) Port value used if your Service Discovery service specified an SRV record.<br />container\_port - (Optional) Port value, already specified in the task definition, to be used for your service discovery service.<br />container\_name - (Optional) Container name value, already specified in the task definition, to be used for your service discovery service. | <pre>object({<br>    registry_arn   = optional(string)<br>    port           = optional(number)<br>    container_port = optional(number)<br>    container_name = optional(string)<br>  })</pre> | `null` | no |
| <a name="input_task_definition_arn"></a> [task\_definition\_arn](#input\_task\_definition\_arn) | (Optional) ARN of Task Definition. | `string` | `null` | no |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_service_discovery_service_arn"></a> [service\_discovery\_service\_arn](#output\_service\_discovery\_service\_arn) | n/a |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
