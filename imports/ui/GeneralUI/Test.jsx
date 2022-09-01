//Core imports
import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';

//Component imports

//Semantic-UI
import {Button, Input} from "semantic-ui-react";

//Other
var outerBox = null;
var colCropLines = [];
var rowCropLines = [];
var mouse = {
    x: 0,
    y: 0,
    startX: 0,
    startY: 0
};
var imageReady = false;

//Component
class Test extends Component {
    state = {
        file: null
    };

    handleUpload = e => {
        if(e.target.files.length > 0) {
            this.setState({
                file: URL.createObjectURL(e.target.files[0])
            });
            imageReady = true;
        }
    };

    handleMousePos = e => {
        if(e.pageX) {
            mouse.x = e.pageX + window.pageXOffset - 65;
            mouse.y = e.pageY + window.pageYOffset - 65;
        }
    };

    initiateDraw = e => {
        let canvas = document.getElementById('cropSpace');
        let rowCount = document.getElementById('rowCount').value;
        let colCount = document.getElementById('colCount').value;

        this.handleMousePos(e);
        if(imageReady) {
            //generate divs to track
            outerBox = document.createElement('div');
            outerBox.className = 'cropRectangle';
            outerBox.style.left = mouse.x + 'px';
            outerBox.style.top = mouse.y + 'px';

            for (let i = 0; i < rowCount - 1; i++) {
                let rowLine = document.createElement('div');
                rowLine.className = 'cropLineX';
                canvas.appendChild(rowLine);

                rowCropLines.push(rowLine);
            }

            for (let i = 0; i < colCount; i++) {
                let colLine = document.createElement('div');
                colLine.className = 'cropLineY';
                canvas.appendChild(colLine);

                colCropLines.push(document.createElement('div'));
            }

            canvas.appendChild(outerBox);
            canvas.style.cursor = 'crosshair';
        } else {
            //terminate draw
            outerBox = null;
            rowCropLines = [];
            colCropLines = [];

            imageReady = false;
        }
    };

    extendRectangle = e => {
        this.handleMousePos(e);
        if(imageReady) {
            let width = Math.abs(mouse.x - mouse.startX);
            let height = Math.abs(mouse.y - mouse.startY);
            let left = mouse.x - mouse.startX < 0 ? mouse.x : mouse.startX;
            let top = mouse.y - mouse.startY < 0 ? mouse.y : mouse.startY;

            let rowGap = height/(rowCropLines.length + 1);
            let colGap = width/(colCropLines.length + 1);

            outerBox.style.width = width + 'px';
            outerBox.style.height = height + 'px';
            outerBox.style.left = left + 'px';
            outerBox.style.top = top + 'px';

            rowCropLines.forEach((rowCropLine, index) => {
                rowCropLine.style.left = left + 'px';
                rowCropLine.style.top = (rowGap * (index + 1) + top) + 'px';
                rowCropLine.style.width = outerBox.style.width;
            });

            colCropLines.forEach((colCropLine, index) => {
                colCropLine.style.left = (colGap * (index + 1) + left) + 'px';
                colCropLine.style.top = top + 'px';
                colCropLine.style.height = outerBox.style.height;
            });
        }
    };

    render() {
        return (
            <div>
                # Rows: <input id={'rowCount'} type={'number'}/>
                # Col: <input id={'colCount'} type={'number'}/>
                <input type='file' onChange={this.handleUpload}/>
                <br/>
                <div id={'cropSpace'} onClick={e => this.initiateDraw(e)} onMouseMove={e => this.extendRectangle(e)} style={{width: 2000, height: 2000}}>
                    <img style={{maxHeight: 800}} src={this.state.file}/>
                </div>
            </div>
        )
    }
}

//Type-checking
Test.propTypes = {};

export default Test;