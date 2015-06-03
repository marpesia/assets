<?php

App::uses('AppController', 'Controller');
class ExamplesController extends AppController {
	public $uses = array();

	public function beforeFilter() {
		parent::beforeFilter();

	}

	public function beforeRender() {
		parent::beforeRender();

	}	

	public function handlebars_data() {

		$view = new View($this, false);
		$view->layout = null;
		$html = $view->render('handlebars');
		echo json_encode(array('result'=>1,'html' => $html, 'variable'=>$variable));
		die;	

	}

	public function mixed(){
		//to round a decimal number
		$number = round($number, 0, PHP_ROUND_HALF_EVEN);
	}
}