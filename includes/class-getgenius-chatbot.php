<?php
// don't load directly
if (!defined('ABSPATH')) {
    die('-1');
}

class GetGenius_Chatbot {
    private $loader;

    public function __construct(){
        $this->loader = new GetGenius_Loader();
    }


    public function init(){
        $this->define_hooks(); 
        $this->loader->run();
    }

    private function define_hooks(){
        $this->loader->add_action('wp_enqueue_scripts', $this, 'custom_chatbot_scripts');
    }

    function custom_chatbot_scripts() {
        wp_enqueue_script('custom_script', GETGENIUS_PLUGIN_URL . 'assets/js/chatbot.js', array(), null, true);       
        wp_localize_script( 'custom_script', 'getgeniusChatbotSettings', 
            array(                
                'greetingMessage'   => get_option('getgenius_greeting_message', 'Hallo! Wie kann ich Dir heute helfen?'),
                'webhookUrl'        => get_option('getgenius_webhook_url', ''),
                'title'             => get_option('getgenius_title', 'ChatBot'),
                'privacyNotice'     => get_option('getgenius_privacy_notice', 'Durch die Nutzung unseres Chatbots stimmen Sie der Verarbeitung Ihrer Daten gemäß unserer Datenschutzerklärung zu. Ihre Nachrichten werden verschlüsselt übertragen und nicht dauerhaft gespeichert.'),
                'limitMessage'      => get_option('getgenius_limit_message', 'Du hast das Limit erreicht. Bitte kontaktiere uns unter info@example.com oder ruf uns an!'),
                'messageLimit'      => get_option('getgenius_message_limit', 10),
            )
        );
        wp_enqueue_style('custom-chatbot-style', GETGENIUS_PLUGIN_URL . 'assets/css/chatbot.css', array());
    }
}