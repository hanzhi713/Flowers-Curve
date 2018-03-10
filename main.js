$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});
var TwoPI = Math.PI * 2;

var topCanvas = document.getElementById('canvas-top');
var bottomCanvas = document.getElementById('canvas-bottom');
var outerCircleParam = document.getElementById('mcRadius');
var innerCircleParam = document.getElementById('innerRadius');
var outerCircleCheck = document.getElementById('showOC');
var innerCircleCheck = document.getElementById('showIC');
var clearBeforeDrawingCheck = document.getElementById('clearBeforeDrawing');
var drawingStepParam = document.getElementById('step');
var drawingDelayParam = document.getElementById('delay');
var completenessParam = document.getElementById('ratio');
var skeletonCheck = document.getElementById('showSk');
var reverseDirectionCheck = document.getElementById('direction');

var dotSizeMinParam = document.getElementById('dotSizeMin');
var dotSizeMaxParam = document.getElementById('dotSizeMax');
var dotDistanceMinParam = document.getElementById('dotDistanceMin');
var dotDistanceMaxParam = document.getElementById('dotDistanceMax');
var dotRotMinParam = document.getElementById('dotRotMin');
var dotRotMaxParam = document.getElementById('dotRotMax');

var mDotSize = document.getElementById('m-dotSize');
var mDotColor = document.getElementById('m-dotColor');
var mDotDistance = document.getElementById('m-dotDistance');
var mDotRot = document.getElementById('m-dotRot');
var mDotID = document.getElementById('m-dotID');

var gifSizeParam = document.getElementById('f-size');
var gifIntervalParam = document.getElementById('f-interval');
var gifTransparentCheck = document.getElementById('f-transparent');
var gifBgColorParam = document.getElementById('f-bgcolor');
var gifFrameDelayParam = document.getElementById('f-delay');
var gifQualityParam = document.getElementById('f-quality');
var gifLastFrameDelayParam = document.getElementById('f-lastdelay');

var pngSizeParam = document.getElementById('p-size');
var pngTransparentCheck = document.getElementById('p-transparent');
var pngBgColorParam = document.getElementById('p-bgcolor');

var dots = {};
var flag = {stop: false};
var currentJobs = [];

window.onload = function (ev) {
    parseConfigJSON(localStorage.getItem('cache'));
};

window.onchange = function (ev) {
    saveConfigToBrowser();
};

function removeDot(id) {
    delete dots[id];
    $('#' + id).hide(300, function () {
        $('#' + id).remove();
    });
    saveConfigToBrowser();
}

function addDot() {
    var dotSize = +$('#dotSize').val();
    var dotColor = $('#dotColor').val();
    var dotDist = +$('#dotDistance').val();
    var dotRot = +$('#dotRotOffset').val();

    // var dotDistCap = +innerCircleParam.value;
    // if (dotDist > dotDistCap)
    //     alert('Dot distance should be no greater than the inner circle radius');
    // else
    addDotHelper((new Date()).valueOf().toString(), dotSize, dotColor, dotDist, dotRot);
}

/**
 * return a random integer in [min, max]
 * @param {number} min
 * @param {number} max
 * @return number
 * */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomDot() {
    // var dotDistCap = +innerCircleParam.value;
    var randDotDistMax = +dotDistanceMaxParam.value;

    var dotSize = randInt(+dotSizeMinParam.value, +dotSizeMaxParam.value);
    var dotColor = '#' + (Math.floor(Math.random() * 256 * 256 * 256)).toString(16);
    var dotDist = randInt(+dotDistanceMinParam.value, randDotDistMax); //> dotDistCap ? dotDistCap : randDotDistMax);
    var dotRot = randInt(+dotRotMinParam.value, +dotRotMaxParam.value);
    addDotHelper((new Date()).valueOf().toString(), dotSize, dotColor, dotDist, dotRot);
}

function addDotHelper(currentTime, dotSize, dotColor, dotDist, dotRot) {
    dots[currentTime] = new Dot(dotSize, dotColor, dotDist, dotRot);
    $('#settings').append("<tr id=\"" + currentTime + "\">" +
        "                    <td onclick='preModify(this)' data-toggle=\"modal\" data-target=\"#DotModalCenter\">Distance: " + dotDist + "&nbsp;&nbsp;Color:" +
        "                        <span style=\"width: 15px; height: 15px; background-color: " + dotColor + ";display: inline-block\"></span><br/>" +
        "                        Size: " + dotSize + "&nbsp;&nbsp;Rotation: " + dotRot + "°" +
        "                    </td>" +
        "                    <th width='50px'>" +
        "                        <button type=\"button\" class=\"close\" aria-label=\"Close\" onclick=\"removeDot('" + currentTime + "')\">" +
        "                            <span aria-hidden=\"true\">&times;</span>" +
        "                        </button>" +
        "                    </th>" +
        "                </tr>"
    );
    saveConfigToBrowser();
}

function preModify(td) {
    var dot = dots[td.parentNode.id];
    mDotSize.value = dot.size;
    mDotColor.value = dot.color;
    mDotDistance.value = dot.distance;
    mDotRot.value = Math.round(dot.rotOffset / Math.PI * 180);
    mDotID.value = td.parentNode.id;
}

function postModify() {
    var dot = dots[mDotID.value];
    var dotSize = +mDotSize.value;
    var dotColor = mDotColor.value;
    var dotDist = +mDotDistance.value;
    var dotRot = +mDotRot.value;
    var tr = document.getElementById(mDotID.value);
    tr.cells[0].innerHTML = "Distance: " + dotDist + "&nbsp;&nbsp;Color:" +
        "                        <span style=\"width: 15px; height: 15px; background-color: " + dotColor + ";display: inline-block\"></span><br/>" +
        "                        Size: " + dotSize + "&nbsp;&nbsp;Rotation: " + dotRot + "°";
    dot.size = dotSize;
    dot.color = dotColor;
    dot.distance = dotDist;
    dot.rotOffset = dotRot / 180 * Math.PI;
    saveConfigToBrowser();
}

function stopDrawing() {
    flag.stop = true;
    for (var i = 0; i < currentJobs.length; i++) {
        clearTimeout(currentJobs[i]);
    }
    currentJobs = [];
}

function adjustDotDistanceCap(input) {
    // var newCap = +input.value;
    // // var oldCap = +dotDistanceMaxParam.max;
    // dotDistanceMaxParam.max = newCap;
    // var oldValue = +dotDistanceMaxParam.value;
    // if (oldValue > newCap)
    //     dotDistanceMaxParam.value = newCap;
}

function saveConfigToBrowser() {
    localStorage.setItem('cache', getConfigJSON());
}

function getConfigJSON() {
    var config = {
        outerCircleRadius: +outerCircleParam.value,
        innerCircleRadius: +innerCircleParam.value,
        showOuterCircle: outerCircleCheck.checked,
        showInnerCircle: innerCircleCheck.checked,
        showSkeleton: skeletonCheck.checked,
        clearBeforeDrawing: clearBeforeDrawingCheck.checked,
        drawingStep: +drawingStepParam.value,
        drawingDelay: +drawingDelayParam.value,
        completeness: +completenessParam.value,
        reverseDirection: reverseDirectionCheck.checked,

        dots: dots,

        dotSizeMin: +dotSizeMinParam.value,
        dotSizeMax: +dotSizeMaxParam.value,
        dotDistanceMin: +dotDistanceMinParam.value,
        dotDistanceMax: +dotDistanceMaxParam.value,
        dotRotMin: +dotRotMinParam.value,
        dotRotMax: +dotRotMaxParam.value,

        frameSize: +gifSizeParam.value,
        frameDelay: +gifFrameDelayParam.value,
        frameTransparent: gifTransparentCheck.checked,
        frameBgColor: gifBgColorParam.value,
        frameQuality: +gifQualityParam.value,
        frameInterval: +gifIntervalParam.value,
        lastFrameDelay: +gifLastFrameDelayParam.value,

        pngSize: +pngSizeParam.value,
        pngTransparent: pngTransparentCheck.checked,
        pngBgColor: pngBgColorParam.value
    };
    return JSON.stringify(config);
}

function parseConfigJSON(json) {
    if (json === "" || json === null) return;
    try {
        var obj = JSON.parse(json);
        outerCircleParam.value = obj.outerCircleRadius === undefined ? 300 : obj.outerCircleRadius;
        innerCircleParam.value = obj.innerCircleRadius === undefined ? 120 : obj.innerCircleRadius;
        outerCircleCheck.checked = obj.showOuterCircle === undefined ? true : obj.showOuterCircle;
        innerCircleCheck.checked = obj.showInnerCircle === undefined ? false : obj.showInnerCircle;
        skeletonCheck.checked = obj.showSkeleton === undefined ? false : obj.showSkeleton;
        clearBeforeDrawingCheck.checked = obj.clearBeforeDrawing === undefined ? true : obj.clearBeforeDrawing;
        drawingStepParam.value = obj.drawingStep === undefined ? 0.005 : obj.drawingStep;
        drawingDelayParam.value = obj.drawingDelay === undefined ? 2 : obj.drawingDelay;
        completenessParam.value = obj.completeness === undefined ? 1 : obj.completeness;
        reverseDirectionCheck.checked = obj.reverseDirection === undefined ? false : obj.reverseDirection;

        dots = obj.dots;

        dotSizeMinParam.value = obj.dotSizeMin === undefined ? 1 : obj.dotSizeMin;
        dotSizeMaxParam.value = obj.dotSizeMax === undefined ? 5 : obj.dotSizeMax;
        dotDistanceMinParam.value = obj.dotDistanceMin === undefined ? 0 : obj.dotDistanceMin;
        dotDistanceMaxParam.value = obj.dotDistanceMax === undefined ? 120 : obj.dotDistanceMax;
        dotRotMinParam.value = obj.dotRotMin === undefined ? 0 : obj.dotRotMin;
        dotRotMaxParam.value = obj.dotRotMax === undefined ? 360 : obj.dotRotMax;

        gifSizeParam.value = obj.frameSize === undefined ? 320 : obj.frameSize;
        gifFrameDelayParam.value = obj.frameDelay === undefined ? 25 : obj.frameDelay;
        gifTransparentCheck.checked = obj.frameTransparent === undefined ? false : obj.frameTransparent;
        gifBgColorParam.value = obj.frameBgColor === undefined ? '#FFFFFF' : obj.frameBgColor;

        if (gifTransparentCheck.checked)
            gifBgColorParam.disabled = true;

        gifQualityParam.value = obj.frameQuality === undefined ? 10 : obj.frameQuality;
        gifIntervalParam.value = obj.frameInterval === undefined ? 40 : obj.frameInterval;
        gifLastFrameDelayParam.value = obj.lastFrameDelay === undefined ? 1000 : obj.lastFrameDelay;

        pngSizeParam.value = obj.pngSize === undefined ? 640 : obj.pngSize;
        pngTransparentCheck.checked = obj.pngTransparent === undefined ? false : obj.pngTransparent;
        pngBgColorParam.value = obj.pngBgColor === undefined ? '#FFFFFF' : obj.pngBgColor;

        if (pngTransparentCheck.checked)
            pngBgColorParam.disabled = true;

        for (var key in dots) {
            addDotHelper(key, dots[key].size, dots[key].color, dots[key].distance, Math.round(180 * dots[key].rotOffset / Math.PI));
        }
    } catch (e) {
        alert(e);
    }
}

function saveConfig() {
    saveAs(new Blob([getConfigJSON()], {type: "text/plain;charset=utf-8"}), "config.json");
}

function loadConfig(files) {
    if (files.length) {
        var file = files[0];
        var reader = new FileReader();
        reader.onload = function () {
            parseConfigJSON(this.result);
        };
        reader.readAsText(file);
    }
}

/**
 * @return Number
 * Get the *real* width of the pattern produced
 * */
function getRealSize(){
    var maxDotDist = 0;
    var maxDot = null;
    for (var key in dots) {
        var dotDist = Math.abs(dots[key].distance);
        if (dotDist > maxDotDist){
            maxDot = dots[key];
            maxDotDist = dotDist;
        }
    }
    var innerCircleRadius = +innerCircleParam.value;
    var outerCircleRadius = +outerCircleParam.value;
    var skeletonLength = outerCircleRadius - innerCircleRadius + maxDotDist + maxDot.size + 5;
    if (innerCircleRadius > 0)
        return Math.max(outerCircleRadius + 2, skeletonLength) * 2;
    else
        return Math.max(outerCircleRadius - innerCircleRadius * 2 + 2, skeletonLength) * 2;
}

/**
 * @param {Number} realSize
 * @return Number
 * */
function getTranslation(realSize){
    return realSize / 2 - topCanvas.width / 2;
}

function saveToPNG() {
    var innerCircleRadius = +innerCircleParam.value;
    var outerCircle = new Circle(topCanvas.width / 2, topCanvas.height / 2, +outerCircleParam.value);

    var ruler = new Ruler(new Circle(outerCircle.x, outerCircle.y + outerCircle.radius - innerCircleRadius, innerCircleRadius), getDotArray());
    ruler.showCircle = innerCircleCheck.checked;
    ruler.showSkeleton = skeletonCheck.checked;
    ruler.reverse = reverseDirectionCheck.checked;

    stopDrawing();
    flag.stop = false;

    draw(outerCircle, ruler, 0, +drawingStepParam.value, +completenessParam.value, function () {
        var pngSize = +pngSizeParam.value;
        var transparent = pngTransparentCheck.checked;
        var bgColor = pngBgColorParam.value;

        var tempCanvas = document.getElementById('canvas-temp');
        tempCanvas.width = pngSize;
        tempCanvas.height = pngSize;
        var tempCxt = tempCanvas.getContext('2d');

        if (!transparent) {
            tempCxt.fillStyle = bgColor;
            tempCxt.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
        }

        var realPatternSize = getRealSize(), translation = getTranslation(realPatternSize);
        tempCxt.scale(pngSize / realPatternSize, pngSize / realPatternSize);
        tempCxt.translate(translation, translation);

        tempCxt.drawImage(bottomCanvas, 0, 0);
        tempCxt.drawImage(topCanvas, 0, 0);
        tempCanvas.toBlobHD(function (blob) {
            saveAs(blob, 'flowers-curve.png');
        });
    });
}

function saveToGIF() {
    var frameSize = +gifSizeParam.value;
    var transparent = gifTransparentCheck.checked;
    var gif = new GIF({
        workers: 4,
        quality: +gifQualityParam.value,
        workerScript: './gif.worker.js',
        width: frameSize,
        height: frameSize
    });

    stopDrawing();
    flag.stop = false;

    var topCxt = topCanvas.getContext('2d');
    var bottomCxt = bottomCanvas.getContext('2d');

    var tempCanvas = document.getElementById('canvas-temp');
    tempCanvas.width = frameSize;
    tempCanvas.height = frameSize;
    var tempCxt = tempCanvas.getContext('2d');

    if (!transparent) {
        tempCxt.fillStyle = gifBgColorParam.value;
        tempCxt.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    var realPatternSize = getRealSize(), translation = getTranslation(realPatternSize);
    tempCxt.scale(frameSize / realPatternSize, frameSize / realPatternSize);
    tempCxt.translate(translation, translation);

    if (clearBeforeDrawingCheck.checked)
        clear();

    var outerCircleRadius = +outerCircleParam.value;
    var innerCircleRadius = +innerCircleParam.value;

    var outerCircle = new Circle(topCanvas.width / 2, topCanvas.height / 2, outerCircleRadius);
    if (outerCircleCheck.checked)
        outerCircle.draw(bottomCxt);

    var ruler = new Ruler(new Circle(outerCircle.x, outerCircle.y + outerCircle.radius - innerCircleRadius, innerCircleRadius), getDotArray());
    ruler.showCircle = innerCircleCheck.checked;
    ruler.showSkeleton = skeletonCheck.checked;
    ruler.reverse = reverseDirectionCheck.checked;

    var radiiDiff;
    if (ruler.circle.radius < 0){
        ruler.circle.radius = -ruler.circle.radius;
        ruler.reverse = !ruler.reverse;
        radiiDiff = outerCircle.radius + ruler.circle.radius;
    }
    else
        radiiDiff = outerCircle.radius - ruler.circle.radius;

    var drawingInterval = +drawingDelayParam.value;
    var innerCirclePerimeter = ruler.circle.radius * 2 * Math.PI;
    var outerCirclePerimeter = outerCircleRadius * 2 * Math.PI;
    var drawingStep = +drawingStepParam.value;
    var completeness = +completenessParam.value;
    var totalRotationAngle = completeness * TwoPI * lcm(outerCircleRadius, ruler.circle.radius) / outerCircleRadius;
    var initialRotation = Math.PI * 1.5;

    var progressLabel = $('#progressLabel');
    var progressbar = $('#progressbar');
    progressbar.width('0%');

    var frameInterval = +gifIntervalParam.value;
    var frameDelay = +gifFrameDelayParam.value;
    for (var i = initialRotation, delay = 0, counter = 0; i < initialRotation + totalRotationAngle; i += drawingStep, delay += drawingInterval, counter += 1) {
        currentJobs.push((function (i, delay, counter) {
                return setTimeout(function () {
                    if (!flag.stop) {
                        ruler.erase(bottomCxt);
                        if (outerCircleCheck.checked)
                            outerCircle.draw(bottomCxt);

                        var newPos = rad2cor(outerCircle.x, outerCircle.y, radiiDiff, i);
                        ruler.moveTo(newPos[0], newPos[1]);
                        ruler.angle = (i - initialRotation) * outerCirclePerimeter / innerCirclePerimeter;
                        ruler.draw(topCxt, bottomCxt);

                        if (counter % frameInterval === 0) {
                            if (transparent)
                                tempCxt.clearRect(0, 0, topCanvas.width, topCanvas.height);
                            else
                                tempCxt.fillRect(0, 0, topCanvas.width, topCanvas.height);
                            tempCxt.drawImage(bottomCanvas, 0, 0);
                            tempCxt.drawImage(topCanvas, 0, 0);
                            gif.addFrame(tempCxt, {
                                copy: true,
                                delay: frameDelay //frameInterval + frameInterval * drawingStep
                            });

                            var progress = (i - initialRotation) / totalRotationAngle * 100;
                            progressbar.width(progress + '%');
                            progressLabel.text(lan['Drawing: '] + progress.toFixed(1) + '%');
                        }
                    }
                }, delay);
            }
        )(i, delay, counter));
    }
    currentJobs.push((function (i, delay) {
            return setTimeout(function () {
                if (!flag.stop) {
                    if (transparent)
                        tempCxt.clearRect(0, 0, topCanvas.width, topCanvas.height);
                    else
                        tempCxt.fillRect(0, 0, topCanvas.width, topCanvas.height);

                    tempCxt.drawImage(bottomCanvas, 0, 0);
                    tempCxt.drawImage(topCanvas, 0, 0);
                    gif.addFrame(tempCxt, {
                        copy: true,
                        delay: +gifLastFrameDelayParam.value
                    });

                    progressbar.width('0%');

                    gif.on('progress', function (p) {
                        if (Math.abs(1 - p) < 0.0001) {
                            progressbar.width('100%');
                            progressLabel.text(lan['Save as GIF: Finished']);
                        }
                        else {
                            p = p * 100;
                            progressbar.width(p + '%');
                            progressLabel.text(lan['Save as GIF: '] + p.toFixed(1) + '%');
                        }
                    });

                    gif.on('finished', function (blob) {
                        saveAs(blob, 'flowers-curve.gif');
                    });

                    gif.render();
                }
            }, delay);
        }
    )(i, delay + drawingInterval));
}

function getDotArray() {
    var dotArray = [];
    for (var key in dots) {
        dotArray.push(dots[key]);
    }
    return dotArray;
}

function previewRuler() {
    var topCxt = topCanvas.getContext('2d');
    var bottomCxt = bottomCanvas.getContext('2d');

    clear();

    var outerCircle = new Circle(topCanvas.width / 2, topCanvas.height / 2, +outerCircleParam.value);
    outerCircle.draw(bottomCxt);

    var ruler = new Ruler(new Circle(outerCircle.x, outerCircle.y + outerCircle.radius - +innerCircleParam.value, Math.abs(+innerCircleParam.value)), getDotArray());
    ruler.showCircle = true;
    ruler.showSkeleton = true;
    ruler.reverse = reverseDirectionCheck.checked;
    ruler.draw(topCxt, bottomCxt);
}

function clear() {
    clearTop();
    clearBottom();
}

function clearTop() {
    var topCxt = topCanvas.getContext('2d');
    topCxt.clearRect(0, 0, topCanvas.width, topCanvas.height);
}

function clearBottom() {
    var bottomCxt = bottomCanvas.getContext('2d');
    bottomCxt.clearRect(0, 0, bottomCanvas.width, bottomCanvas.height);
}

/**
 * @param {Function} callback
 * */
function caller(callback) {
    var innerCircleRadius = +innerCircleParam.value;
    var outerCircle = new Circle(topCanvas.width / 2, topCanvas.height / 2, +outerCircleParam.value);

    var ruler = new Ruler(new Circle(outerCircle.x, outerCircle.y + outerCircle.radius - innerCircleRadius, innerCircleRadius), getDotArray());
    ruler.showCircle = innerCircleCheck.checked;
    ruler.showSkeleton = skeletonCheck.checked;
    ruler.reverse = reverseDirectionCheck.checked;

    stopDrawing();
    flag.stop = false;

    draw(outerCircle, ruler, +drawingDelayParam.value, +drawingStepParam.value, +completenessParam.value, callback);
}

/**
 * @param {Circle} outerCircle
 * @param {Ruler} ruler
 * @param {number} drawingInterval
 * @param {number} drawingStep
 * @param {number} completeness
 * @param {Function} callback
 * */
function draw(outerCircle, ruler, drawingInterval, drawingStep, completeness, callback) {
    var topCxt = topCanvas.getContext('2d');
    var bottomCxt = bottomCanvas.getContext('2d');

    if (clearBeforeDrawingCheck.checked)
        clear();

    if (outerCircleCheck.checked)
        outerCircle.draw(bottomCxt);

    var progressLabel = $('#progressLabel');
    var progressbar = $('#progressbar');
    progressbar.width('0%');

    var radiiDiff;
    if (ruler.circle.radius < 0){
        ruler.circle.radius = -ruler.circle.radius;
        ruler.reverse = !ruler.reverse;
        radiiDiff = outerCircle.radius + ruler.circle.radius;
    }
    else
        radiiDiff = outerCircle.radius - ruler.circle.radius;


    var totalRotationAngle = completeness * TwoPI * lcm(outerCircle.radius, ruler.circle.radius) / outerCircle.radius;
    var initialRotation = Math.PI * 1.5;
    for (var i = initialRotation, delay = 0, counter = 0; i < initialRotation + totalRotationAngle; i += drawingStep, delay += drawingInterval, counter += 1) {
        currentJobs.push((function (i, delay, counter) {
                return setTimeout(function () {
                    if (!flag.stop) {
                        ruler.erase(bottomCxt);
                        if (outerCircleCheck.checked)
                            outerCircle.draw(bottomCxt);

                        var newPos = rad2cor(outerCircle.x, outerCircle.y, radiiDiff, i);
                        ruler.moveTo(newPos[0], newPos[1]);
                        ruler.angle = (i - initialRotation) * outerCircle.radius / ruler.circle.radius;
                        ruler.draw(topCxt, bottomCxt);

                        if (counter % 20 === 0) {
                            var progress = (i - initialRotation) / totalRotationAngle * 100;
                            progressbar.width(progress + '%');
                            progressLabel.text(lan['Drawing: '] + progress.toFixed(1) + '%');
                        }
                    }
                }, delay);
            }
        )(i, delay, counter));
    }
    currentJobs.push((function (delay) {
            return setTimeout(function () {
                progressbar.width('100%');
                progressLabel.text(lan['Drawing: Finished']);
                if (callback !== undefined)
                    callback()
            }, delay);
        }
    )(delay));
}

/**
 * @param {number} x
 * @param {number} y
 * @return number
 * */
function lcm(x, y) {
    var a = x, b = y;
    while (a % b !== 0) {
        var c = a % b;
        a = b;
        b = c;
    }
    return x * y / b
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {number} rad
 * @return Array
 * */
function rad2cor(x, y, radius, rad) {
    return [x + radius * Math.cos(rad), y - radius * Math.sin(rad)];
}

/**
 * @constructor
 * @param {Circle} circle
 * @param {Array} dots
 * */
function Ruler(circle, dots) {
    this.circle = circle;
    this.dots = dots;
    this.angle = 0;
    this.showCircle = true;
    this.showSkeleton = true;
    this.reverse = false;

    /**
     * @param {CanvasRenderingContext2D} topCxt
     * @param {CanvasRenderingContext2D} bottomCxt
     * */
    this.draw = function (topCxt, bottomCxt) {
        this.drawCircle(bottomCxt);
        this.drawDots(topCxt);
        this.drawSkeleton(bottomCxt);
    };
    /**
     * @param {CanvasRenderingContext2D} bottomCxt
     * */
    this.erase = function (bottomCxt) {
        if (this.showCircle || this.showSkeleton) {
            var previousLineWidth = bottomCxt.lineWidth;
            bottomCxt.lineWidth = previousLineWidth + 2;
            bottomCxt.globalCompositeOperation = 'destination-out';
            this.eraseCircle(bottomCxt);
            this.eraseSkeleton(bottomCxt);
            bottomCxt.globalCompositeOperation = 'source-over';
            bottomCxt.lineWidth = previousLineWidth;
        }
    };
    /**
     * @param {CanvasRenderingContext2D} bottomCxt
     * */
    this.drawCircle = function (bottomCxt) {
        if (this.showCircle)
            this.circle.draw(bottomCxt);
    };
    /**
     * @param {CanvasRenderingContext2D} bottomCxt
     * */
    this.eraseCircle = function (bottomCxt) {
        this.circle.draw(bottomCxt);
    };
    /**
     * @param {CanvasRenderingContext2D} topCxt
     * */
    this.drawDots = function (topCxt) {
        //var previousStyle = topCxt.fillStyle;
        for (var i = 0; i < this.dots.length; i++) {
            var dotPos = rad2cor(this.circle.x, this.circle.y, this.dots[i].distance, this.reverse ? this.angle + this.dots[i].rotOffset : TwoPI - (this.angle + this.dots[i].rotOffset) % TwoPI);
            topCxt.fillStyle = this.dots[i].color;
            topCxt.beginPath();
            topCxt.arc(dotPos[0], dotPos[1], this.dots[i].size, 0, TwoPI);
            topCxt.closePath();
            topCxt.fill();
        }
        //topCxt.fillStyle = previousStyle;
    };
    /**
     * @param {CanvasRenderingContext2D} bottomCxt
     * */
    this.drawSkeleton = function (bottomCxt) {
        if (this.showSkeleton) {
            for (var i = 0; i < this.dots.length; i++) {
                var dotPos = rad2cor(this.circle.x, this.circle.y, this.dots[i].distance, this.reverse ? this.angle + this.dots[i].rotOffset : TwoPI - (this.angle + this.dots[i].rotOffset) % TwoPI);
                bottomCxt.moveTo(this.circle.x, this.circle.y);
                bottomCxt.lineTo(dotPos[0], dotPos[1]);
            }
            bottomCxt.stroke();
        }
    };
    /**
     * @param {CanvasRenderingContext2D} bottomCxt
     * */
    this.eraseSkeleton = function (bottomCxt) {
        if (this.showSkeleton) {
            bottomCxt.beginPath();
            for (var i = 0; i < this.dots.length; i++) {
                var dotPos = rad2cor(this.circle.x, this.circle.y, this.dots[i].distance, this.reverse ? this.angle + this.dots[i].rotOffset : TwoPI - (this.angle + this.dots[i].rotOffset) % TwoPI);
                bottomCxt.moveTo(dotPos[0], dotPos[1]);
                bottomCxt.lineTo(this.circle.x, this.circle.y);
                bottomCxt.arc(this.circle.x, this.circle.y, 2, 0, TwoPI);
            }
            bottomCxt.closePath();
            bottomCxt.stroke();
            bottomCxt.fill();
        }
    };
    /**
     * @param {number} x
     * @param {number} y
     * */
    this.moveTo = function (x, y) {
        this.circle.moveTo(x, y);
    };
}

/**
 * @constructor
 * @param {number} size
 * @param {string} color
 * @param {number} distance
 * @param {number} rotOffset
 * */
function Dot(size, color, distance, rotOffset) {
    this.size = size;
    this.color = color;
    this.distance = distance;
    this.rotOffset = rotOffset / 180 * Math.PI;
}

/**
 * @constructor
 * @param {Number} x
 * @param {Number} y
 * @param {Number} radius
 * */
function Circle(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;

    /**
     * @param {CanvasRenderingContext2D} cxt
     * */
    this.draw = function (cxt) {
        cxt.beginPath();
        cxt.arc(this.x, this.y, this.radius, 0, TwoPI);
        cxt.closePath();
        cxt.stroke();
    };

    /**
     * @param {CanvasRenderingContext2D} cxt
     * */
    this.erase = function (cxt) {
        cxt.globalCompositeOperation = 'destination-out';
        var previousLineWidth = cxt.lineWidth;
        cxt.lineWidth = previousLineWidth + 2;
        this.draw(cxt);
        cxt.lineWidth = previousLineWidth;
    };

    /**
     * @param {number} x
     * @param {number} y
     * */
    this.moveTo = function (x, y) {
        this.x = x;
        this.y = y;
    }
}