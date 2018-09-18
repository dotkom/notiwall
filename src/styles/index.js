const Online = `
  , {
    background-color: #001533;
  }

  .App {
    background: #001533;
  }
  .Header {
    background-image: url(https://online.ntnu.no/static/img/online_logo.svg);
    background-size: 60vw;
    background-repeat: no-repeat;
    min-height: 18vw;

    background-position: bottom left;
  }

  .Vakter > h1{
     margin-top: 0.5em;
  }

  .Bus{
    display: flex;
    justify-content: flex-start;
    flex-flow: row;
  }

  .Bus > .bus-wrapper{
    background-color: #000000bb;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-around;
    justify-content: space-evenly;
  }

  .Bus .bus-stop {
    flex: 1 0 100%;
    margin-bottom: 0;
  }

  .Bus .bus-dir {
    flex: 1 0 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-around;
    justify-content: space-evenly;
  }
  .Bus .bus-dir-item {
    margin-top: 0;
    flex: 0 0 114px;
  }

  .Bus .bus-list {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
  }
  .Bus .bus-list-item {
    display: flex;
    flex-flow: row nowrap;
  }
  .Bus .bus-list-item-number {
    width: 1.5em;
    text-align: left;
  }
  .Bus .bus-list-item-time::before {
    color: white;
    content: "- ";
  }
`;

const SmartMirror = `
, {
  /*background-color: #121280;*/
}

.App {
  /*background: #121280;*/
}
`;

export { Online, SmartMirror };
