# Lucky Wizard Bot - FIXED Referral System
# Install: pip install python-telegram-bot==20.7

from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from telegram.ext import (
    Application,
    CommandHandler,
    PreCheckoutQueryHandler,
    MessageHandler,
    filters,
    ContextTypes
)
import logging

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

BOT_TOKEN = "8265410692:AAGkx4V3CPymkRxaidj2gI9MvD2wJaiY0Ck"
WEBAPP_URL = "https://visionary-gingersnap-ab5c81.netlify.app/"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start with referral"""
    user_id = update.effective_user.id
    user_name = update.effective_user.first_name
    
    # Get referrer from start parameter
    referrer_id = None
    if context.args and len(context.args) > 0:
        start_param = context.args[0]
        logger.info(f"📥 User {user_id} ({user_name}) started with param: {start_param}")
        
        # Extract referrer ID (format: ref123456)
        if start_param.startswith('ref'):
            referrer_id = start_param[3:]  # Remove 'ref' prefix
            logger.info(f"🔗 Referrer ID extracted: {referrer_id}")
            
            # Validate it's a number
            if not referrer_id.isdigit():
                logger.warning(f"⚠️ Invalid referrer ID format: {referrer_id}")
                referrer_id = None
            elif referrer_id == str(user_id):
                logger.warning(f"⚠️ User trying to refer themselves")
                referrer_id = None
    
    # Build WebApp URL with referrer in start parameter
    webapp_url = WEBAPP_URL
    if referrer_id:
        # Pass referrer ID as tgWebAppStartParam in URL fragment
        webapp_url = f"{WEBAPP_URL}#tgWebAppStartParam=ref{referrer_id}"
        logger.info(f"📱 WebApp URL with referral: {webapp_url}")
    else:
        logger.info(f"📱 WebApp URL without referral: {webapp_url}")
    
    # Create button
    keyboard = [[
        InlineKeyboardButton(
            "🎰 Play Lucky Wizard", 
            web_app=WebAppInfo(url=webapp_url)
        )
    ]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    # Welcome message
    if referrer_id:
        message = (
            f"🎰 *Welcome {user_name}!*\n\n"
            "🎁 *Referral Bonus Active!*\n"
            "You and your friend will both get *5 Stars*!\n\n"
            "👇 Click below to claim your bonus:"
        )
    else:
        message = (
            f"🎰 *Welcome {user_name}!*\n\n"
            "🎮 Play slot machines\n"
            "⭐ Win real Telegram Stars\n"
            "🎁 Refer friends for bonuses\n\n"
            "👇 Click below to start:"
        )
    
    await update.message.reply_text(
        message,
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )
    
    logger.info(f"✅ Start message sent to {user_id}")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Help message"""
    help_text = (
        "🎰 *Lucky Wizard Help*\n\n"
        "🎮 *How to Play:*\n"
        "• Open game and deposit Stars\n"
        "• Spin and win!\n\n"
        "🎁 *Referrals:*\n"
        "• Share your link from Referrals tab\n"
        "• Both get 5 Stars bonus\n\n"
        "Need help? @ll_li_llll"
    )
    await update.message.reply_text(help_text, parse_mode='Markdown')

async def precheckout_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Approve payments"""
    query = update.pre_checkout_query
    await query.answer(ok=True)
    
    logger.info(f"✅ Payment approved: {query.total_amount} Stars from {query.from_user.id}")

async def successful_payment(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Confirm payment"""
    payment = update.message.successful_payment
    stars = payment.total_amount
    
    await update.message.reply_text(
        f"✅ *Payment Successful!*\n\n"
        f"⭐ *{stars} Stars* added to your balance!\n\n"
        f"🎰 Continue playing and good luck! 🍀",
        parse_mode='Markdown'
    )
    
    logger.info(f"💰 Payment completed: {stars} Stars from {update.effective_user.id}")

def main():
    """Start bot"""
    logger.info("=" * 60)
    logger.info("🤖 LUCKY WIZARD BOT STARTING...")
    logger.info("=" * 60)
    
    app = Application.builder().token(BOT_TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(PreCheckoutQueryHandler(precheckout_callback))
    app.add_handler(MessageHandler(filters.SUCCESSFUL_PAYMENT, successful_payment))
    
    logger.info("✅ Bot handlers registered!")
    logger.info(f"📱 WebApp: {WEBAPP_URL}")
    logger.info("🔗 Referral system: ACTIVE")
    logger.info("🎯 Referral format: /start ref<USER_ID>")
    logger.info("=" * 60)
    
    app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()