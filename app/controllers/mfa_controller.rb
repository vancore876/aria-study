class MfaController < ApplicationController
  before_action :authenticate_user!

  def enable
    @user = current_user
    render json: { 
      qr_code: RQRCode::QRCode.new(@user.totp_provisioning_uri).to_svg(
        color: "000000", 
        background: "FFFFFF", 
        size: 200
      )
    }
  end

  def verify
    @user = current_user
    if @user.verify_totp(params[:code])
      session[:mfa_verified] = true
      render json: { success: true, message: "MFA verified" }
    else
      render json: { error: "Invalid code" }, status: :unauthorized
    end
  end
end
