class AnalyticsController < ApplicationController
  def events
    @events = AnalyticsEvent.where(user_id: current_user.id)
                          .order(created_at: :desc)
                          .limit(50)
  end

  def dashboard
    @metrics = Analytics::MetricsService.new(current_user).fetch_all
    @user_activity = AnalyticsEvent.where(event_type: "user_activity")
                                 .group("DATE(created_at)")
                                 .order("created_at DESC")
                                 .limit(30)
  end

  private

  def log_analytics_event(event_name, properties = {})
    AnalyticsEvent.create!(
      user_id: current_user.id,
      event_type: event_name,
      properties: properties,
      ip_address: request.remote_ip,
      user_agent: request.user_agent
    )
  end
end
