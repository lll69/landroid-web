import './fonts'

import * as ReactDOM from 'react-dom/client';
import ViewerApp from './ViewerApp';

ReactDOM.createRoot(document.getElementById("root")!).render(
    <ViewerApp />
);

const script = document.createElement("script");
script.src = "/counter.js";
script.defer = script.async = true;
document.head.appendChild(script);
