import React from "react";
import {MainApp} from "./components/MainApp";
import { createRoot } from 'react-dom/client';

const container = document.getElementById('app');
const root = createRoot(container);
root.render(
    <MainApp />
);
