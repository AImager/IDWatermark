getApp();
var waterMark = new(require('../../utils/waterMark.js'))(),
  constConfig = {
    colorMap: [
      ['0', '#808080'],
      ['1', '#000000'],
      ['2', '#ee0000'],
      ['3', '#ffffff'],
      ['4', '#87CEEB']
    ],
    sizeMap: [
      ['0', 20],
      ['1', 40],
      ['2', 60],
      ['3', 80],
      ['4', 100],
      ['5', 120],
      ['6', 140],
      ['7', 160]
    ],
    opacityMap: [
      ['0', 0],
      ['1', 10],
      ['2', 25],
      ['3', 40],
      ['4', 55],
      ['5', 70],
      ['6', 85],
      ['7', 100],
    ],
    densityMap: [
      ['0', 20],
      ['1', 30],
      ['2', 40],
      ['3', 50],
      ['4', 60],
      ['5', 70],
      ['6', 80],
      ['7', 90]
    ],
    densityMapItem: [
      ['0', '0.4'],
      ['1', '0.5'],
      ['2', '0.6'],
      ['3', '1.0'],
      ['4', '1.2'],
      ['5', '1.4'],
      ['6', '1.6'],
      ['7', '1.8']
    ],
    defaultWatermarkConfig: {
      color: ['0', '#808080'],
      opacity: ['3', 40],
      size: ['0', 20],
      density: ['3', 50],
    },
    text: '此证件仅用作XX使用!',
    canvasId: "myCanvas",
    debounceDelay: 200
  };

Page({
  data: {
    app: '',
    bool: false,
    canvasW: 100,
    canvasH: 200,
    inputFocus: false,
    currentColorIndex: constConfig.defaultWatermarkConfig.color[0],
    currentSizeIndex: constConfig.defaultWatermarkConfig.size[0],
    currentDensityIndex: constConfig.defaultWatermarkConfig.density[0],
    currentOpacityIndex: constConfig.defaultWatermarkConfig.opacity[0],
    isSave: false,
    text: '此证件仅用作XX使用!',
    ColorMap: constConfig.colorMap,
    SizeMap: constConfig.sizeMap,
    OpacityMap: constConfig.opacityMap,
    DensityMap: constConfig.densityMap,
    DensityMapItem: constConfig.densityMapItem,
  },

  onReady: function() {
    // this.setDefaultConfig();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: '身份证水印',
      path: '/pages/index/index',
      imageUrl: '../../images/shareImage.png'
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      isSave: false
    })
  },

  /**
   * 选择照片
   */
  chooseImg: function(e) {
    var that = this;
    wx.chooseImage({
      count: 1,
      success: function(e) {
        var imgUrl = e.tempFilePaths[0];
        wx.getImageInfo({
          src: imgUrl,
          success: function(e) {
            var imgW = e.width,
              imgH = e.height,
              canvasW = wx.getSystemInfoSync().windowWidth,
              canvasH = canvasW * imgH / imgW;
            that.setData({
              canvasW: canvasW,
              canvasH: canvasH,
              imgW: imgW,
              imgH: imgH,
            });
            var canvasConfig = {
              text: that.data.text,
              id: constConfig.canvasId,
              color: '#ffffff',
              xStart: 0,
              yStart: -e.width,
              xSpace: that.currentDensity(that.data.currentDensityIndex)/2,
              ySpace: that.currentDensity(that.data.currentDensityIndex),
              rotate: 45,
              opacity: .5,
              width: canvasW,
              height: canvasH,
              scale: canvasW / imgW,
              size: 20,
              imgUrl: imgUrl,
              color: that.currentColor(that.data.currentColorIndex),
              opacity: that.currentOpacity(that.data.currentOpacityIndex),
              size: that.currentSize(that.data.currentSizeIndex),
              density: that.currentDensity(that.data.currentDensityIndex),
            };
            waterMark.mark(canvasConfig).then(function() {
              that.setData({
                draw: true,
              })
            });
          }
        })
      }
    });
  },

  /**
   * text改变监听器
   */
  handleTextChange: function(e, debounceDelay) {
    var that, time, timeOut, n, s,
      r = function() {
        var timeDiff = new Date().getTime() - time;
        timeDiff < debounceDelay && timeDiff >= 0 ? timeOut = setTimeout(r, debounceDelay - timeDiff) : (timeOut = null, s = e.apply(that, n), timeOut || (that = n = null));
      };
    return function() {
      return that = this, n = arguments, time = new Date().getTime(), timeOut || (timeOut = setTimeout(r, debounceDelay)), s;
    };
  }(function(e) {
    this.data.draw && waterMark.reRendering({
      text: e.detail.value
    });
    this.setData({
      text: e.detail.value
    })
  }, constConfig.debounceDelay),

  /**
   * text获得焦点监听器
   */
  handleTextFocus: function() {
    this.setData({
      inputFocus: true
    });
  },

  /**
   * text失去焦点监听器
   */
  handleTextBlur: function(e) {
    this.setData({
      inputFocus: false,
    });
    console.log(this.data.text)
  },

  /**
   * 点击尺寸监听器
   */
  handelSizeClick: function(e) {
    var id = e.target.id;
    if (id) {
      var that = this;
      this.setData({
          currentSizeIndex: id
        },
        function() {
          if (!that.data.draw) return false;
          waterMark.reRendering({
            size: that.currentSize(that.data.currentSizeIndex)
          });
        }
      );
    }
  },

  /**
   * 点击透明度监听器
   */
  handelOpacityClick: function(e) {
    var id = e.target.id;
    if (id) {
      var that = this;
      this.setData({
          currentOpacityIndex: id
        },
        function() {
          if (!that.data.draw) return false;
          waterMark.reRendering({
            opacity: that.currentOpacity(that.data.currentOpacityIndex)
          });
        }
      );
    }
  },

  /**
   * 点击密度监听器
   */
  handelDensityClick: function(e) {
    var id = e.target.id;
    if (id) {
      var that = this;
      this.setData({
          currentDensityIndex: id
        },
        function() {
          if (!that.data.draw) return false;
          waterMark.reRendering({
            xSpace: that.currentDensity(that.data.currentDensityIndex)/2,
            ySpace: that.currentDensity(that.data.currentDensityIndex)
          });
        });
    };
  },

  /**
   * 点击颜色监听器
   */
  handleColorClick: function(e) {
    var id = e.target.id;
    if (id) {
      var that = this;
      this.setData({
          currentColorIndex: id
        },
        function() {
          if ( !that.data.draw) return false;
          waterMark.reRendering({
            color: that.currentColor(that.data.currentColorIndex)
          });
        });
    }
  },

  /**
   * 保存图片
   */
  saveImg: function(e) {
    if (!this.data.draw) return false;
    wx.showLoading({
      title: '保存中'
    });
    wx.canvasToTempFilePath({
      canvasId: constConfig.canvasId,
      destWidth: this.data.imgW,
      destHeight: this.data.imgH,
      success: function(e) {
        wx.saveImageToPhotosAlbum({
          filePath: e.tempFilePath,
          success: function() {
            wx.hideLoading(),
              wx.showToast({
                title: '已保存到相册',
                icon: 'success',
                duration: 2e3
              })
          }
        })
      }
    });
    this.setData({
      isSave: true
    })
  },

  /**
   * 清除文字
   */
  clearText: function(){
    this.setData({
      inputFocus: false,
      text: '',
    });
    this.data.draw && waterMark.reRendering({
      text: ''
    });
    this.setData({
      inputFocus: true
    })
  },


  /**
   * 获取当前属性
   */
  currentColor: function(index) {
    var temp = this.data.ColorMap[index];
    return temp == null ? constConfig.defaultWatermarkConfig.color[1] : temp[1];
  },
  currentSize: function(index) {
    var temp = this.data.SizeMap[index];
    return temp == null ? constConfig.defaultWatermarkConfig.size[1] : temp[1];
  },
  currentDensity: function(index) {
    var temp = this.data.DensityMap[index];
    return temp == null ? constConfig.defaultWatermarkConfig.density[1] : temp[1];
  },
  currentOpacity: function(index) {
    var temp = this.data.OpacityMap[index];
    return temp == null ? constConfig.defaultWatermarkConfig.opacity[1] : temp[1];
  }
});