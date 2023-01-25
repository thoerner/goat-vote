import AWS from 'aws-sdk'

AWS.config.update({ region: 'us-east-1' })

const credentials = new AWS.Credentials({
    accessKeyId: process.env.REACT_APP_DYNAMODB_KEY,
    secretAccessKey: process.env.REACT_APP_DYNAMODB_SECRET,
    region: 'us-east-1'
})

const ddb = new AWS.DynamoDB({
    apiVersion: '2012-08-10',
    credentials: credentials
})

const unmarshal = (item) => {
    const unmarshalled = {}
    for (const key in item) {
        if (item[key].S) {
            unmarshalled[key] = item[key].S
        } else if (item[key].SS) {
            unmarshalled[key] = item[key].SS
        } else if (item[key].N) {
            unmarshalled[key] = item[key].N
        }
    }
    return unmarshalled
}

export const addNewProposal = async (proposal, options) => {

    // Generate a unique ID for the auction
    var CUSTOMEPOCH = 1300000000000 // artificial epoch
    function generateRowId(shardId /* range 0-64 for shard/slot */) {
        var ts = new Date().getTime() - CUSTOMEPOCH // limit to recent
        var randid = Math.floor(Math.random() * 512)
        ts = (ts * 64)   // bit-shift << 6
        ts = ts + shardId
        return (ts * 512) + randid
    }
    const id = generateRowId(4).toString()

    const params = {
        TableName: 'goat-vote',
        Item: {
            'proposal-id': { S: id },
            'proposal': { S: proposal },
            'options': { SS: options }
        }
    }
    
    ddb.putItem(params, function(err, data) {
        if (err) {
            console.log("Error", err)
        } else {
            console.log("Success", data)
        }
    })
    console.log(id, proposal, options)
    newProposalTable(id, proposal, options)

    return {
        success: true,
        data: id
    }
}

export const getAllProposals = async () => {
    const params = {
        TableName: 'goat-vote'
    }

    const data = await ddb.scan(params).promise()
    const unmarshalled = data.Items.map(item => unmarshal(item))
    return unmarshalled

}

export const getProposalById = async (id) => {
    const params = {
        TableName: 'goat-vote',
        Key: {
            'proposal-id': { S: id }
        }
    }

    const data = await ddb.getItem(params).promise()
    const unmarshalled = unmarshal(data.Item)
    return unmarshalled

}

export const removeProposalById = async (id) => {


    const params = {
        TableName: 'goat-vote',
        Key: {
            'proposal-id': { S: id }
        }
    }

    const res = ddb.deleteItem(params, () => {})

    if (res.error) {
        return {
            success: false,
            error: res.error
        }
    }

    const params2 = {
        TableName: 'proposal-' + id,
    }

    const res2 = ddb.deleteTable(params2, () => {})

    if (res2.error) {
        return {
            success: false,
            error: res2.error
        }
    } else {
        return {
            success: true,
            error: null
        }
    }
}

export const newProposalTable = async (id, proposal, options) => {

    const params = {
        TableName: `proposal-${id}`,
        KeySchema: [
            { AttributeName: 'address', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'address', AttributeType: 'S' }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    }

    const res = ddb.createTable(params, function(err, data) {})

    if (res.error) {
        return {
            success: false,
            error: res.error
        }
    } else {
        return {
            success: true,
            data: res.data
        }
    }
}

export const vote = async (id, address, option, votes) => {
    const params = {
        TableName: `proposal-${id}`,
        Item: {
            'address': { S: address },
            'option': { S: option },
            'votes': { N: votes }
        }
    }

    const res = ddb.putItem(params, () => {})

    if (res.error) {
        return {
            success: false,
            error: res.error
        }
    } else {
        return {
            success: true,
            data: res.data
        }
    }
}

export const getVoteByAddress = async (id, address) => {
    const params = {
        TableName: `proposal-${id}`,
        Key: {
            'address': { S: address }
        }
    }

    const data = await ddb.getItem(params).promise()
    const unmarshalled = unmarshal(data.Item)
    return unmarshalled.option
}

export const getAllVotes = async (id) => {
    const params = {
        TableName: `proposal-${id}`
    }

    const data = await ddb.scan(params).promise()
    const unmarshalled = data.Items.map(item => unmarshal(item))
    return unmarshalled
}