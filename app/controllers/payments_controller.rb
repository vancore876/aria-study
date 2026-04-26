class PaymentsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_mfa

  def create
    @user = current_user
    session = Stripe::Checkout::Session.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Premium Subscription',
            description: 'Monthly access to all features'
          },
          unit_amount: 2999,
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: "#{root_url}payments/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "#{root_url}payments/cancel",
      client_reference_id: @user.id.to_s
    })

    render json: { session_id: session.id }
  end

  def success
    session = Stripe::Checkout::Session.retrieve(params[:session_id])
    @user = User.find(session.client_reference_id)
    @user.update(subscription_status: 'active', stripe_customer_id: session.customer)
    render json: { message: "Payment successful", subscription_active: true }
  end

  private

  def require_mfa
    unless current_user.subscription_status == 'active' || session[:mfa_verified]
      render json: { error: "MFA verification required" }, status: :unauthorized
    end
  end
end
