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

	public function returnQuery(){
		$dbo = $this->$tabla->getDatasource();	
		$logs = $dbo->getLog();
		$lastLog = end($logs['log']);
		echo $lastLog['query'];
		die;
	}
	
	public function upload(){
		$this->layout = 'iframe';
		$thumb_size = 50;
		$extension = array('jpg','gif','png','jpeg');
		$compression = 75;

		if(!empty($this->data['Event']['file']) && $this->data['Event']['file']['error'] == 0){
			$file = $this->data['Event']['file'];
			if (strlen($file['name'])<5){ //check empty name or no valid
				$this->Session->setFlash('Debes indicar un fichero.', 'flash_error');
				return false;
			}

			if($file['size'] > 2000000){ //check to heavy file
				$this->Session->setFlash('El fichero pesa más de 2 Mb.', 'flash_error');
				return false;
			}

			//check extensions
			$file['name'] = mb_strtolower($file['name']);
			$filetype = strtolower(end(explode(".", $file['name'])));
			if(!in_array($filetype, $extension)){
				$this->Session->setFlash('El tipo de archivo debe ser '. implode(", ", $extension), 'flash_error');
				return false;
			}			
			//check extensions

			//check folder
			$folderName = realpath('').DS."upload".DS;
			if(!is_dir($folderName)) mkdir($folderName,true);
				
			$filename = str_replace(".".$filetype,'',$file['name']);
			$filename = str_replace(' ', '_', $filename);
			$filename .= '_'. strtotime("now").".".$filetype;
		 	//check folder

			// Copy the image into the temporary directory
			$newlocation = $folderName."/".$filename;
			if (!move_uploaded_file($file['tmp_name'],utf8_decode($newlocation))){
				$this->Session->setFlash('No se pudo subir el archivo, probablemente por permisos del sistema de archivos.', 'flash_error');
				return false;
			} else {
				//success upload. Generate thumbnail

				$fullpath = realpath($newlocation);

				$image_info = getimagesize($fullpath);
				$image_type = $image_info[2];
				if( $image_type == IMAGETYPE_JPEG ) {
					$image = imagecreatefromjpeg($fullpath);
				} elseif( $image_type == IMAGETYPE_GIF ) {
					$image = imagecreatefromgif($fullpath);
				} elseif( $image_type == IMAGETYPE_PNG ) {
					$image = imagecreatefrompng($fullpath);
				} else {
					$this->Session->setFlash('El tipo de archivo debe ser '. implode(", ", $extension), 'flash_error');
					return false;
				}	

				//square
				$new_image = imagecreatetruecolor($thumb_size, $thumb_size);

				if(imagesy($image) > imagesx($image)){
					$ratio = $thumb_size / imagesy($image);
					$width = imagesx($image) * $ratio;

					//resize
					$new_image_resize = imagecreatetruecolor($width, $thumb_size);
					
					imagecolortransparent($new_image_resize, imagecolorallocate($new_image_resize, 0, 0, 0));
					imagealphablending($new_image_resize, false);
					imagesavealpha($new_image_resize, true);
					
					imagecopyresampled($new_image_resize, $image, 0, 0, 0, 0, $width, $thumb_size, imagesx($image), imagesy($image));
					$image = $new_image_resize; 
					//resize
				} else {
					$ratio = $thumb_size / imagesx($image);
					$height = imagesy($image) * $ratio;

					//resize
					$new_image_resize = imagecreatetruecolor($thumb_size, $height);
					
					imagecolortransparent($new_image_resize, imagecolorallocate($new_image_resize, 0, 0, 0));
					imagealphablending($new_image_resize, false);
					imagesavealpha($new_image_resize, true);
					
					imagecopyresampled($new_image_resize, $image, 0, 0, 0, 0, $thumb_size, $height, imagesx($image), imagesy($image));
					$image = $new_image_resize; 
					//resize
				}

				//save
				$filename_thumb = str_replace($filename, "thumb_".$filename, $fullpath);
				if( $image_type == IMAGETYPE_JPEG ) {
					imagejpeg($image,$filename_thumb,$compression);
				} elseif( $image_type == IMAGETYPE_GIF ) {
					imagegif($image,$filename_thumb);         
				} elseif( $image_type == IMAGETYPE_PNG ) {
					imagepng($image,$filename_thumb);
				}   
				//save

				$thumbnail_url = Router::url('/upload/thumb_'.$filename, true);

				$response = array(
					'fileInput' => $this->data['Event']['file_input'],
					'filename' => $filename,
					'thumbnail_url' => $thumbnail_url
				);

				$this->Session->setFlash('Archivo subido correctamente', 'flash_success');
				$this->set('response',$response);
			}			
			
		}
	}
}