import React from 'react';
import {Singleton, SingletonClass} from "./Singleton";
import styled from "styled-components"
import {createRoot} from "react-dom/client";
import honda from '../img/Honda1.jpg'
import vesta from '../img/Vesta.png'
import almera from '../img/Almera.png'

const Shadow = ({children}) => {
    function attachShadow (host) {
        const shadowRoot = host.attachShadow({ mode: "open" });
        const root = createRoot(shadowRoot);
        root.render(children);
    }
    return (
        <div ref={attachShadow}/>
    )
}
customElements.define('call-me', class extends HTMLElement {
    connectedCallback() {
        this.attachShadow({mode: 'open'}).innerHTML = `<p>Перезвоните мне</p>`;
        const style = document.createElement("style");
        this.shadowRoot.appendChild(style);
        style.textContent = ":host-context(h3) { font-style: italic; }" +
            ":host {cursor: pointer}";
        this.shadowRoot.firstElementChild.onclick =
            e => window.location.href = '' //Тут какой-нибудь путь до странички с информацией
    }
});

customElements.define("time-formatted", class extends HTMLElement {
    render() {
        let date = new Date(this.getAttribute('datetime') || Date.now());

        this.innerHTML = new Intl.DateTimeFormat("default", {
            year: this.getAttribute('year') || undefined,
            month: this.getAttribute('month') || undefined,
            day: this.getAttribute('day') || undefined,
            hour: this.getAttribute('hour') || undefined,
            minute: this.getAttribute('minute') || undefined,
            second: this.getAttribute('second') || undefined,
            timeZoneName: this.getAttribute('time-zone-name') || undefined,
        }).format(date);
    }

    connectedCallback() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
    }

    static get observedAttributes() {
        return ['datetime', 'year', 'month', 'day', 'hour', 'minute', 'second', 'time-zone-name'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }
});
setInterval(() => time.setAttribute('datetime', new Date()), 1000);
export const MainApp = () => {
    const auto_show_class = new SingletonClass("Chausow");
    const auto_show_func = new Singleton("Chausow");
    const det_style = {
        marginBottom: 8,
    }
    const sum_style = {
        cursor: "pointer"
    }
    const main_style = {
        display: 'block'
    }

    return (
        <div>
            <Header>
                <h1 id="elem">Салон поддержанных авто {auto_show_class.getName()}</h1>
                <div style={{display: "flex", gap: 8}}>
                    Текущее время:<time-formatted id="time" hour="numeric" minute="numeric" second="numeric"/>
                </div>
            </Header>
            <Shadow>
                <template id="element" style={main_style}>
                    <details style={det_style}>
                        <summary style={sum_style}>
                            <span><slot>Honda Accord</slot></span>
                        </summary>
                        <slot>
                            <img src={honda} alt={'honda1'} width={300} height={180}/>
                            <table>
                                <tbody>
                                <tr>
                                    <td>Год выпуска</td>
                                    <td>2008</td>
                                </tr>
                                <tr>
                                    <td>Пробег</td>
                                    <td>130тыс км</td>
                                </tr>
                                <tr>
                                    <td>Цена</td>
                                    <td>550тыс руб</td>
                                </tr>
                                </tbody>
                            </table>
                        </slot>
                        <slot>
                            <button>Купить!</button>
                        </slot>
                    </details>
                    <details style={det_style}>
                        <summary style={sum_style}>
                            <span><slot>LADA Vesta</slot></span>
                        </summary>
                        <div>
                            <slot>
                                <img src={vesta} alt={'vesta'} width={300} height={180}/>
                                <table>
                                    <tbody>
                                    <tr>
                                        <td>Год выпуска</td>
                                        <td>2017</td>
                                    </tr>
                                    <tr>
                                        <td>Пробег</td>
                                        <td>80тыс км</td>
                                    </tr>
                                    <tr>
                                        <td>Цена</td>
                                        <td>750тыс руб</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </slot>
                            <slot>
                                <button>Купить!</button>
                            </slot>
                        </div>
                    </details>
                    <details style={det_style}>
                        <summary style={sum_style}>
                            <span><slot>Nissan Almera</slot></span>
                        </summary>
                        <div>
                            <slot>
                                <img src={almera} alt={'almera'} width={300} height={180}/>
                                <table>
                                    <tbody>
                                    <tr>
                                        <td>Год выпуска</td>
                                        <td>2017</td>
                                    </tr>
                                    <tr>
                                        <td>Пробег</td>
                                        <td>48тыс км</td>
                                    </tr>
                                    <tr>
                                        <td>Цена</td>
                                        <td>899тыс руб</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </slot>
                            <slot>
                                <button>Купить!</button>
                            </slot>
                        </div>
                    </details>
                </template>
                Телефон для связи: 8 (800) 365 23 23
            </Shadow>
            <h3><call-me/></h3>
        </div>
    );
};

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-content: center;
  align-items: center;
`;

