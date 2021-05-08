import React from 'react'
import Test from './components/test'

import { HashRouter, Switch, Route, Link } from 'react-router-dom'


// router
/**
 * 如果有新页面，新组件
 * 在此插入和添加链接
 * 
 */
const App = () => {
  return (
    <HashRouter>
      <div className="container">
        <ul>
          <li><Link to="/base">base</Link></li>
        </ul>
        <div id="sub-container"></div>
        <Switch>
          <Route exact path="/"><Test></Test></Route>
          <Route path="/base"><Test></Test></Route>
        </Switch>
      </div>
    </HashRouter>
  )
}
export default App
