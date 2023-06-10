import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import "mvp";
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import '../node_modules/antd/dist/antd'
import { applyMiddleware, createStore } from 'redux';
import promiseMiddleware from 'redux-promise';
import ReduxThunk from 'redux-thunk';
import Reducer from './_reducers'
import { BrowserRouter } from 'react-router-dom';

const createStoreWithMiddeleWare = applyMiddleware(promiseMiddleware, ReduxThunk)(createStore);



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider
    store={createStoreWithMiddeleWare(Reducer,
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
      window.__REDUX_DEVTOOLS_EXTENSION__()
    )}>
    <BrowserRouter>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </BrowserRouter>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
