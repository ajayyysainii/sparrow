import callRouter from "./routes/call.route.js"
import authRouter from "./routes/auth.route.js"
import statsRouter from "./routes/stats.route.js"
import aimodelRouter from "./routes/aimodel.route.js"
import paymentRouter from "./routes/payment.route.js"
const MODULE_ROUTE_MAPPING = [
    {
        prefix: '/auth',
        router: authRouter
    },
    {
        prefix: '/call',
        router: callRouter
    },
    {
        prefix: '/stats',
        router: statsRouter
    },
    {
        prefix: '/aimodel',
        router: aimodelRouter
    },
    {
        prefix: '/payment',
        router: paymentRouter
    }
]

export default MODULE_ROUTE_MAPPING