<?php

if (!defined('ABSPATH')) {
    exit;
}

class GetGenius {
    private static $instance = null;

    public $chatbot = null;

    public $admin = null;

    public static function get_instance(){
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct(){
        if (!session_id()) {
            session_start();
        }
    }

    public function init(){
        $this->load_dependencies();
        $this->initialize_admin();
        // Only initialize chatbot if enabled in settings
        if (get_option('getgenius_enable_feature', false)) {
            $this->initialize_chatbot();
        }
    }

    private function load_dependencies() {
        require_once GETGENIUS_PLUGIN_DIR . 'includes/class-getgenius-loader.php';
        require_once GETGENIUS_PLUGIN_DIR . 'includes/class-getgenius-chatbot.php';
        require_once GETGENIUS_PLUGIN_DIR . 'includes/class-getgenius-admin.php';
    }

    private function initialize_admin() {
        $this->admin = new GetGenius_Admin();
        $this->admin->init();
    }


    private function initialize_chatbot() {
        $this->chatbot = new GetGenius_Chatbot(); // class-getgenius-chatbot
        $this->chatbot->init();
    }
}
