import request from '@/utils/request.js'

export default {
    // 获取list数据
    getListData() {
        return request.get('api/systems/wcs/lists')
    }
}

