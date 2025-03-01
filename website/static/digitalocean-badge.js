class DigitalOceanBadge extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        const shadow = this.attachShadow({
            mode: "open",
        });

        const anchor = document.createElement("a");
        anchor.setAttribute("class", "badge");
        anchor.setAttribute("href", "https://m.do.co/c/ae7a4578200b");
        anchor.setAttribute("target", "_blank");
        anchor.setAttribute(
            "aria-label",
            "Martin's DigitalOcean referral link"
        );

        const left = document.createElement("div");
        left.setAttribute("class", "left");
        left.innerHTML = '<img src="images/DO_Logo_icon_white.webp">';
        anchor.appendChild(left);

        const right = document.createElement("div");
        right.setAttribute("class", "right");
        right.textContent = "Powered by DigitalOcean";
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
                  background-color:#066eff;
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
                  background-color:#066eff;
                  color: white;
                  text-transform: uppercase;
              }
          }
          `;

        shadow.appendChild(style);
        shadow.appendChild(anchor);
    }
}

customElements.define("digitalocean-badge", DigitalOceanBadge);