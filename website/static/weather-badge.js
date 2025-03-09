class WeatherBadge extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({
            mode: "open",
        });

        const weather = await fetch("/microservice/weather");
        const json = await weather.json();

        const anchor = document.createElement("div");
        anchor.setAttribute("class", "badge");
        anchor.setAttribute(
            "aria-label",
            "The weather at Martin's house"
        );

        const left = document.createElement("div");
        left.setAttribute("class", "left");
        left.innerHTML = `<img src="images/weather/${json.symbolCode}.webp">`;
        anchor.appendChild(left);

        const right = document.createElement("div");
        right.setAttribute("class", "right");
        right.textContent = `${json.airTemperature}°, ${json.windSpeed} m/s, ${json.text.toLowerCase()}`;
        anchor.appendChild(right);

        const style = document.createElement("style");
        style.textContent = `
          .badge {
              display: flex;
              width: 210px;
              height: 30px;
              border: 1px solid black;
              box-sizing: border-box;
              font-size: 0.64rem;
              text-decoration: none;
  
              &:active {
                  color: initial;
              }
  
              .left, .right {
                  display: flex;
                  align-items: center;
                  margin: 1px 0 1px 0;
                  height: calc(100% - 2px);
                  font-family: 'Silkscreen';
              }
      
              .left {
                  margin-left: 1px;
                  flex: 1;
                  background-color:#333333;
                  color: white;
                  padding: 0 1px;
                  justify-content: center;

                  img {
                    height: calc(100% - 10px);
                  }
              }
  
              .right {
                  margin-right: 1px;
                  flex: 5;
                  background-color:#333333;
                  color: white;
                  text-transform: uppercase;
              }
          }
          `;

        shadow.appendChild(style);
        shadow.appendChild(anchor);
    }
}

customElements.define("weather-badge", WeatherBadge);