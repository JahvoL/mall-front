<template>
  <div>

    <div style="margin-top: 10px">
      <!--      商品-->
      <el-row :gutter="10">
        <!--    图片-->
        <el-col :span="8">
          <el-card>
            <div>
              <el-image :src="mainImg"></el-image>
            </div>
            <div
                style="margin-top: 20px; display: flex;  flex-wrap: wrap; flex-direction: row; justify-content: flex-start">
              <div style="flex: 1; padding: 5px" v-for="(item, index) in goods.imgs" :key="item">
                <el-image style="width: 60px; height: 60px;" fit="contain" :src="item"
                          @mouseover="show(item)"></el-image>
              </div>
            </div>
          </el-card>
        </el-col>

        <!--    商品细节-->
        <el-col :span="16">
          <el-card>
            <div style="text-align: right">
              <div style="display: inline-block; cursor: pointer; margin-left: 20px" @click="praise">
                <img :src="praiseActiveIcon" alt="点赞" style="width: 15px; ">
                <span style="position: relative; bottom: 2px; color: #666; margin-left: 5px">{{ goods.praise }}</span>
              </div>
            </div>
            <div style="padding: 10px 0; font-size: 20px; font-weight: bold">{{ goods.name }}</div>
            <div style="padding: 10px 0; color: #666; font-size: 14px">{{ goods.description }}</div>
            <div style="padding: 10px 0; color: #999;">
              <span>上架时间</span>
              <span style="margin-left: 20px; color: #666">{{ goods.createTime }}</span>
            </div>

            <div style="padding: 10px 0">
              <span style="color: #999">抢购价</span>
              <span style="margin-left: 10px; color: orangered; font-size: 20px">￥ {{ goods.realPrice }}</span>
              <span style="color: orangered; margin-left: 10px" v-if="goods.discount < 1"> ({{ (goods.discount * 10).toFixed(1) }}折)</span>
            </div>

            <div v-if="goods.discount < 1" style="padding: 10px 0; text-decoration:line-through; color: #999">
              原价：{{ goods.price }}
            </div>
            <div style="padding: 10px 0; color: #999">
              库存：{{ goods.store }}
            </div>

            <div style="padding: 10px 0; color: #999;">
              <span>服务</span>
              <span style="margin-left: 20px; color: #666">
                由“电商平台”发货，并提供售后服务。 23:55前完成下单，预计明天可送达
              </span>
            </div>

            <div style="margin-top: 20px; padding: 10px 0">
              <el-input-number v-model="num" :min="1" :max="10" label="购买数量" style="width: 100px"></el-input-number>
              <el-button style="margin-left: 10px; background-color: orangered; color: white; position: relative"
                         @click="addCart">
                <img :src="cartIcon" style="width: 20px; position: absolute; left: 8px; top: 5px">
                <span style="margin-left: 20px">加入购物车</span>
              </el-button>
              <el-button style="margin-left: 10px; background-color: orangered; color: white" @click="buyNow">立即购买
              </el-button>
            </div>

          </el-card>
        </el-col>

      </el-row>

    </div>
  </div>
</template>

<script>
import API from "@/utils/request";

const url = "/api/video/"

export default {
  name: "Goods",
  data() {
    return {
      messages: [],
      dialogFormVisible: false,
      entity: {},
      address: '',
      mainImg: '',
      cartIcon: require('../../assets/购物车-23.png'),
      praiseActiveIcon: require("../../assets/点赞-激活.png"),
      collectActiveIcon: require("../../assets/收藏-激活.png"),
      num: 1,
      id: 1,
      user: {},
      goods: {imgs: []},
      praiseFlag: false
    };
  },
  created() {
    this.user = sessionStorage.getItem("user") ? JSON.parse(sessionStorage.getItem("user")) : {}
    this.id = this.$route.query.id
    this.load()
  },
  methods: {
    collect() {
      API.post("/api/collect", {
        goodsName: this.goods.name,
        goodsImg: this.goods.imgs[0],
        goodsId: this.goods.id,
        userId: this.user.id
      })
    },
    praise() {
      if (this.praiseFlag) {
        this.$message({
          message: "您已点过赞",
          type: "warning"
        });
        return
      }
      this.praiseFlag = true
      this.entity = JSON.parse(JSON.stringify(this.goods))
      this.entity.praise += 1
      this.entity.imgs = null
      API.put("/api/goods", this.entity).then(res => {
        if (res.code === '0') {
          this.$message({
            message: "点赞成功",
            type: "success"
          });
        } else {
          this.$message({
            message: res.msg,
            type: "error"
          });
        }
        this.load();
      })
    },
    buyNow() {
      if ((this.goods.store - this.num) < 0) {
        this.$message({
          type: 'warning',
          message: '商品库存不足！'
        })
        return
      }
      let cart = []
      cart.push({count: this.num, goods: this.goods, goodsId: this.goods.id})
      this.$store.commit("setCarts", cart)
      this.$router.replace("/front/preOrder")
    },

    reply() {
      this.entity.content = this.entity.reply;
      this.save();
    },

    addCart() {
      if (!this.user.id) {
        this.$message({
          type: 'warning',
          message: '请登录！'
        })
        return
      }
      if ((this.goods.store - this.num) < 0) {
        this.$message({
          type: 'warning',
          message: '商品库存不足！'
        })
        return
      }
      API.post("/api/cart", {goodsId: this.goods.id, count: this.num, userId: this.user.id}).then(res => {
        if (res.code === '0') {
          this.$message({
            type: 'success',
            message: '加入成功！'
          })
        } else {
          this.$message({
            type: 'error',
            message: res.msg
          })
        }
      })
    },
    show(img) {
      this.mainImg = img
      console.log(img)
    },
    load() {
      API.get("/api/goods/" + this.id).then(res => {
        this.goods = res.data

        // 处理图片
        if (!this.goods.imgs) {
          this.goods.imgs = ['']
        } else {
          this.goods.imgs = JSON.parse(this.goods.imgs)
        }
        this.mainImg = this.goods.imgs[0]
      })
    },
  },
};
</script>

<style scoped>

</style>
