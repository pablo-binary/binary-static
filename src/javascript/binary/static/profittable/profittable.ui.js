
var ProfitTableUI = (function(){
    "use strict";

    var profitTableID = "profit-table";
    var cols = ["buy-date", "ref", "contract", "buy-price", "sell-date", "sell-price", "pl"];
    var header = ["Purchase Date", "Ref.", "Contract", "Purchase Price", "Sale Date", "Sale Price", "Profit/Loss"];
    var footer = ["Total Profit/Loss", "", "", "", "", "", ""];

    function createEmptyTable(){
        var localizedHeader = header.map(function(t){return text.localize(t);});

        var data = [];
        var metadata = {
            cols: cols,
            id: profitTableID
        };
        var $tableContainer = Table.createFlexTable(data, metadata, localizedHeader, footer);

        var $pltotal = $tableContainer.
            children("table").
            children("tfoot").
            children("tr").
            attr("id", "pl-day-total");

        return $tableContainer;
    }

    function updateProfitTable(transactions){
        Table.appendTableBody(profitTableID, transactions, createProfitTableRow);
        updateFooter(transactions);
    }

    function updateFooter(transactions){
        var accTotal = document.querySelector("#pl-day-total > .pl").textContent;
        accTotal = parseFloat(accTotal);
        if (isNaN(accTotal)) {
            accTotal = 0;
        }

        var currentTotal = transactions.reduce(function(previous, current){
            var buyPrice = Number(parseFloat(current["buy_price"])).toFixed(2);
            var sellPrice = Number(parseFloat(current["sell_price"])).toFixed(2);
            var pl = sellPrice - buyPrice;
            return previous + pl;
        }, 0);

        var total = accTotal + currentTotal;

        $("#pl-day-total > .pl").text(Number(total).toFixed(2));

        var subTotalType = (total >= 0 ) ? "profit" : "loss";
        $("#pl-day-total > .pl").removeClass("profit").removeClass("loss");
        $("#pl-day-total > .pl").addClass(subTotalType);
    }

    function createProfitTableRow(transaction){
        var buyDate = moment.
            utc(transaction["purchase_time"] * 1000).
            format("YYYY-MM-DD HH:mm:ss").replace(/\s/g, "\n");

        var sellDate = moment.
            utc(transaction["sell_time"] * 1000).
            format("YYYY-MM-DD HH:mm:ss").replace(/\s/g, "\n");


        var ref = transaction["transaction_id"];
        var contract = transaction["longcode"];
        var buyPrice = Number(parseFloat(transaction["buy_price"])).toFixed(2);
        var sellPrice = Number(parseFloat(transaction["sell_price"])).toFixed(2);

        var pl = Number(sellPrice - buyPrice).toFixed(2);

        var plType = (pl >= 0) ? "profit" : "loss";

        var data = [buyDate, ref, contract, buyPrice, sellDate, sellPrice, pl];
        var $row = Table.createFlexTableRow(data, cols, "data");

        $row.children(".buy-date").addClass("break-line");
        $row.children(".pl").addClass(plType);

        return $row[0];
    }

    function initDatepicker(){
        DatepickerUtil.initDatepicker("profit-table-date", moment.utc(), null, 0);
    }

    function clearTableContent(){
        Table.clearTableBody(profitTableID);
        $("#" + profitTableID + ">tfoot").hide();
    }

    return {
        createEmptyTable: createEmptyTable,
        updateProfitTable: updateProfitTable,
        initDatepicker: initDatepicker,
        cleanTableContent: clearTableContent
    };
}());