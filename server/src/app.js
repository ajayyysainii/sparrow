import callRouter from "./routes/call.route.js"

const MODULE_ROUTE_MAPPING = [
    {
        prefix: '/call',
        router: callRouter
    }
]

export default MODULE_ROUTE_MAPPING