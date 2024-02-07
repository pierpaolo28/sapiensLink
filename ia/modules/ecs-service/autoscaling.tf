#####################################
# Amazon ECS Service Metric Scaling #
#####################################

resource "aws_cloudwatch_metric_alarm" "firing" {
  count = var.autoscaling == null ? 0 : 1

  alarm_name          = "${var.autoscaling.cluster_name}-${aws_ecs_service.service_autoscaling[0].name}-firing"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = var.autoscaling.scale_out.evaluation_periods
  metric_name         = var.autoscaling.metric.name
  namespace           = "AWS/ECS"
  period              = var.autoscaling.scale_out.interval_period
  statistic           = var.autoscaling.metric.statistic_type
  threshold           = var.autoscaling.metric.upper_threshold
  dimensions = {
    ClusterName = var.autoscaling.cluster_name
    ServiceName = aws_ecs_service.service_autoscaling[0].name
  }

  alarm_description = "WARNING! ${var.autoscaling.cluster_name}-${aws_ecs_service.service_autoscaling[0].name} is increasing..."
  alarm_actions     = concat([aws_appautoscaling_policy.scale_out[0].arn], var.autoscaling.additional_alarm_actions)
}

resource "aws_cloudwatch_metric_alarm" "relax" {
  count               = var.autoscaling == null ? 0 : 1
  alarm_name          = "${var.autoscaling.cluster_name}-${aws_ecs_service.service_autoscaling[0].name}-relax"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = var.autoscaling.scale_in.evaluation_periods
  metric_name         = var.autoscaling.metric.name
  namespace           = "AWS/ECS"
  period              = var.autoscaling.scale_in.interval_period
  statistic           = var.autoscaling.metric.statistic_type
  threshold           = var.autoscaling.metric.lower_threshold
  dimensions = {
    ClusterName = var.autoscaling.cluster_name
    ServiceName = aws_ecs_service.service_autoscaling[0].name
  }

  alarm_description = "WARNING! ${var.autoscaling.cluster_name}-${aws_ecs_service.service_autoscaling[0].name} is decreasing... we will terminate one of the instance."
  alarm_actions     = concat([aws_appautoscaling_policy.scale_in[0].arn], var.autoscaling.additional_alarm_actions)
}


##################################
# Amazon App Auto Scaling Policy #
##################################

resource "aws_appautoscaling_target" "this" {
  count              = var.autoscaling == null ? 0 : 1
  service_namespace  = "ecs"
  resource_id        = "service/${var.autoscaling.cluster_name}/${aws_ecs_service.service_autoscaling[0].name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = var.autoscaling.min_size
  max_capacity       = var.autoscaling.max_size
}

resource "aws_appautoscaling_policy" "scale_out" {
  count              = var.autoscaling == null ? 0 : 1
  name               = "${var.autoscaling.cluster_name}-${aws_ecs_service.service_autoscaling[0].name}-scale-out"
  service_namespace  = "ecs"
  resource_id        = "service/${var.autoscaling.cluster_name}/${aws_ecs_service.service_autoscaling[0].name}"
  scalable_dimension = "ecs:service:DesiredCount"
  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = var.autoscaling.scale_out.cooldown
    metric_aggregation_type = var.autoscaling.metric.statistic_type
    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 1
    }
  }

  depends_on = [aws_appautoscaling_target.this[0]]
}

resource "aws_appautoscaling_policy" "scale_in" {
  count              = var.autoscaling == null ? 0 : 1
  name               = "${var.autoscaling.cluster_name}-${aws_ecs_service.service_autoscaling[0].name}-scale-in"
  service_namespace  = "ecs"
  resource_id        = "service/${var.autoscaling.cluster_name}/${aws_ecs_service.service_autoscaling[0].name}"
  scalable_dimension = "ecs:service:DesiredCount"
  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = var.autoscaling.scale_in.cooldown
    metric_aggregation_type = var.autoscaling.metric.statistic_type
    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = -1
    }
  }

  depends_on = [aws_appautoscaling_target.this[0]]
}