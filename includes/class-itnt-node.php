<?php

if (!defined('ABSPATH')) {
    exit;
}

class ITNT_Node {
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
        if (get_option('itnt_node_enable_feature', false)) {
            $this->initialize_chatbot();
        }
    }

    private function load_dependencies() {
        require_once ITNT_NODE_PLUGIN_DIR . 'includes/class-itnt-node-loader.php';
        require_once ITNT_NODE_PLUGIN_DIR . 'includes/class-itnt-node-chatbot.php';
        require_once ITNT_NODE_PLUGIN_DIR . 'includes/class-itnt-node-admin.php';
    }

    private function initialize_admin() {
        $this->admin = new ITNT_Node_Admin();
        $this->admin->init();
    }


    private function initialize_chatbot() {
        $this->chatbot = new ITNT_Node_Chatbot();
        $this->chatbot->init();
    }
}
