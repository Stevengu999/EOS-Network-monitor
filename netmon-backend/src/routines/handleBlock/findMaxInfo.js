const getActionsCount = block => {
  if (block.transactions.length < 1) {
    return 0;
  }
  return block.transactions.reduce(
    (result, transaction) => result + (transaction.trx.transaction ? transaction.trx.transaction.actions.length : 0),
    0,
  );
};

const findMaxInfo = ({ current = { transactions: [] }, previous = {}, max_tps = 0, max_aps = 0 }) => {
  const SECOND = 1000;
  const currentTs = Date.parse(current.timestamp);
  const previousTs = Date.parse(previous.timestamp);
  if (currentTs === previousTs) {
    return undefined;
  }
  let live_tps;
  let live_aps;
  if (currentTs - previousTs >= SECOND) {
    live_tps = current.transactions.length;
    live_aps = getActionsCount(current);
  } else {
    live_tps = current.transactions.length + (previous.transactions ? previous.transactions.length : 0);
    live_aps = getActionsCount(current) + (previous.transactions ? getActionsCount(previous) : 0);
  }

  const res = {};
  if (live_tps > max_tps) {
    res.max_tps = live_tps;
    res.max_tps_block = current.block_num;
  }
  if (live_aps > max_aps) {
    res.max_aps = live_aps;
    res.max_aps_block = current.block_num;
  }
  if (res.max_aps || res.max_tps) {
    return res;
  }
  return undefined;
};

module.exports = findMaxInfo;