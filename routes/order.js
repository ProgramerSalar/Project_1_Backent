const express = require("express");
const router = express.Router();
const { Order } = require("../models/order.js");
const { OrderItem } = require("../models/order-item.js");

router.get(`/`, async (req, res) => {
  const orderList = await Order.find().sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.post("/", async (req, res) => {
  const orderitemIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let neworderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      neworderItem = await neworderItem.save();
      return neworderItem._id;
    })
  );

  const orderitemIdsResolve = await orderitemIds;
  const totalPrices = await Promise.all(orderitemIdsResolve.map(async (orderItemId)=>{
    const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
    const totalPrice = orderItem.product.price * orderItem.quantity;
    return totalPrice
}))

const totalPrice = totalPrices.reduce((a,b) => a +b , 0);
// console.log(totalPrice)

  let order = new Order({
    orderItems: orderitemIdsResolve,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();

  if (!order) return res.status(400).send("the order cannot be created!");

  res.send(order);
});

// {
//     "orderItems" : [
//       {
//           "quantity": 4,
//           "product" : "65643fa6c3637a9920fd7cbf"
//       },
//       {
//           "quantity": 2,
//           "product" : "65643fcdc3637a9920fd7cc2"
//       }
//   ],

//       "shippingAddress1" : "Flowers Street , 45",
//       "shippingAddress2" : "1-B",
//       "city": "Prague",
//       "zip": "00000",
//       "country": "Czech Republic",
//       "phone": "+420702241333",
//       "user": "6564564bf749e4d07d188a3b"
//   }

// 2023-11-28T04:44:58.607Z"

router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

router.put("/:id", async (req, res) => {
  let order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  order = await order.save();

  if (!order) return res.status(400).send("the order cannot be update!");

  res.send(order);
});

router.delete('/:id', (req, res)=>{
    Order.findByIdAndDelete(req.params.id).then(async order =>{
        if(order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndDelete(orderItem)
            })
            return res.status(200).json({success: true, message: 'the order is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "order not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})


router.get('/get/totalsales', async (req, res)=> {
    const totalSales= await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({totalsales: totalSales.pop().totalsales})
})


router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Order.countDocuments()

    if(!orderCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        orderCount: orderCount
    });
})

router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})




module.exports = router;
