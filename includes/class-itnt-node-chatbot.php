<?php
// don't load directly
if (!defined('ABSPATH')) {
    die('-1');
}

class ITNT_Node_Chatbot{
    private $loader;

    public function __construct(){
        $this->loader = new ITNT_Node_Loader();
    }


    public function init(){
        $this->define_hooks();
        $this->loader->run();
    }

    private function define_hooks(){
        $this->loader->add_action('wp_enqueue_scripts', $this, 'custom_chatbot_scripts');
    }

    function custom_chatbot_scripts() {
        wp_enqueue_script(
            'custom_script',
            ITNT_NODE_PLUGIN_URL . 'assets/js/chatbot.js',
            // array('jquery'),
            array(),
            null,
            true
        );

        wp_localize_script(
            'custom_script',
            'itntChatbotSettings',
            array(
                'greetingMessage' => get_option('itnt_node_greeting_message', 'Hallo! Wie kann ich Dir heute helfen?'),
                'webhookUrl' => get_option('itnt_node_webhook_url', ''),
            )
        );

        wp_enqueue_style(
            'custom-chatbot-style',
            ITNT_NODE_PLUGIN_URL . 'assets/css/chatbot.css',
            array()
        );
    }

}