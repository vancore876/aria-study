class AnalyticsEvent < ApplicationRecord
  belongs_to :user
  store_accessor :properties, :page_url, :referrer, :event_duration, :device_type

  scope :user_activity, -> { where(event_type: "user_activity") }
  scope :payment_events, -> { where(event_type: "payment_processed") }
  scope :auth_events, -> { where(event_type: "authentication_event") }

  def self.track(event_type, user, properties = {})
    create!(
      user: user,
      event_type: event_type,
      properties: properties,
      ip_address: request.remote_ip,
      user_agent: request.user_agent
    )
  end
end
