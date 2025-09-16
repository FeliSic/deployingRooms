import { Router } from "@vaadin/router"
import { state } from "./state";
import './pages/home-page';
import './pages/chat-page'
(function main(){
  const router = new Router(document.querySelector('.root'));
  router.setRoutes([
  {path: '/', component: 'home-page'},
  {path: '/chatRoom', component: 'chat-page'}
]);
  state.init()
})()