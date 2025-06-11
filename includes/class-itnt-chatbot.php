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
        // $this->loader->add_action('wp_enqueue_scripts', $this, 'nocodecreative_scripts');
    }

    function custom_chatbot_scripts() {
        wp_enqueue_script(
            'custom_script',
            plugin_dir_url(__FILE__) . '../assets/cb/script.js',
            array(),
            null,
            true
        );

        wp_enqueue_style(
            'custom-chatbot-style',
            plugin_dir_url(__FILE__)  . '../assets/cb/css/chat.css',
            array()
        );
    }
    
    function nocodecreative_scripts() {
        wp_enqueue_script(
            'chatbot-script',
            plugin_dir_url(__FILE__) . '../assets/js/chatbot/setup.js',
            array(),
            null,
            true
        );

        wp_enqueue_script(
            'chatbot',
            'https://cdn.jsdelivr.net/gh/WayneSimpson/n8n-chatbot-template@ba944c3/chat-widget.js',
            array(),
            null,
            true // Load in footer
        );
    }
}