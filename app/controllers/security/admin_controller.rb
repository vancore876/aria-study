module Security
  class AdminController < ApplicationController
    before_action :authenticate_admin!

    def index
      @audits = Security::Audit
                .where(user_id: User.where(admin: true))
                .order(created_at: :desc)
                .limit(50)
    end

    def search
      @audits = Security::Audit
                .where("ip_address ILIKE ?", "%#{params[:ip]}%")
                .or(Security::Audit.where("user_id = ?", params[:user_id]))
                .order(created_at: :desc)
                .limit(100)
    end

    private

    def authenticate_admin!
      unless current_user&.admin?
        render json: { error: "Admin access required" }, status: :unauthorized
      end
    end
  end
end
