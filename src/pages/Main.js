
const calculateVotes = (goatBalance, stakedGoatBalance) => {
    // implement quadratic voting

    let curve = 1
    let goatVotes = 0
    for (let i = 1; i <= goatBalance; i++) {
        goatVotes += 1/i**curve
    }
    let stakedGoatVotes = 0
    for (let i = 1; i <= stakedGoatBalance; i++) {
        stakedGoatVotes += (1/i**curve) * 1.1
    }
    return (goatVotes + stakedGoatVotes).toFixed(2)
}

const Main = props => {
    const goatBalance = props.balance.goatBalance
    const stakedGoatBalance = props.balance.stakedGoatBalance
    return (
        <div>
            <h1>Goat Vote</h1>
            <p>Vote with your Goat Gauds!</p>
            <p>Goats: {goatBalance}</p>
            <p>Staked Goats: {stakedGoatBalance}</p>
            <p>Voting Power:{" "} 
                {calculateVotes(goatBalance, stakedGoatBalance)}
            </p>
            <button>Yay</button>
            {" "}
            <button>Nay</button>
        </div>
    )
}

export default Main