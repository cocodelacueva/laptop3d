import './assets/css/style.scss';
//import { smoothScroll } from './assets/js/helpers';
import init3d from './assets/js/model-3d';
//import legalesModal from './assets/js/legales-modal';
//import animationsCSS from './assets/js/animations-css';

(function init() {
  const siteWrapper = document.querySelector('#site-wrapper-3d');

  if (siteWrapper) {

    //do
    init3d(siteWrapper);

  } else {
    //reload
    setTimeout(init, 1000);
  }
})();
