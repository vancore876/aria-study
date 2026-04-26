module Admin
  class DashboardController < ApplicationController
    before_action :authenticate_admin!

    def show
      @total_users = User.count
      @active_users = User.where("subscription_status = 'active'").count
      @pending_mfa = User.where(mfa_enabled: false).count
      @revenue_month = Payment.where(created_at: Date.today.beginning_of_month..Date.today.end_of_month).sum(:amount)
      @user_growth = User.select("DATE_TRUNC('day', created_at) as day, COUNT(*) as count")
                        .where(created_at: 30.days.ago..Time.now)
                        .group("day")
                        .order("day DESC")
      @subscription_trends = Payment.select("DATE_TRUNC('week', created_at) as week, COUNT(*) as count")
                                  .where(created_at: 6.months.ago..Time.now)
                                  .group("week")
                                  .order("week")
    end

    private

    def authenticate_admin!
      unless current_user&.admin?
        render json: { error: "Admin access required" }, status: :unauthorized
      end
    end
  end
end
