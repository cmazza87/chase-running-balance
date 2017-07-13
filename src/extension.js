var main = function () {

    log("Enter main()");

    var runs = 0;

    var intervalId = setInterval(function () {

        runs++;

        // Give up if transaction history has not loaded in 10 seconds.
        if (runs > 100) {
            log("Clear interval (history not loaded)");
            clearInterval(intervalId);
            return;
        }

        // Return early while waiting for jQuery to load.
        if (typeof $ !== 'function') {
            return;
        }

        // Configure MutationObserver and try to display running balance.
        // Return early while waiting for transactions to load.
        var activityTransactions = $('#activity-transactions');
        if (activityTransactions.length > 0) {
            displayRunningBalance();

            log("Configure MutationObserver");
            var observer = new MutationObserver(function (mutations, observer) {
                displayRunningBalance();
            });

            observer.observe(activityTransactions[0], {
                attributes: true,
                subtree: true
            });
        } else {
            return;
        }

        log("Clear interval");
        clearInterval(intervalId);

    }, 100);

    function displayRunningBalance() {
        log("Enter displayRunningBalance()");

        // Remove Balance column if it already exists.
        $('.running-balance-ext').remove();

        // Get transaction history.
        var transactions = $('#creditCardTransTable tbody tr.border').get();

        // Return early while waiting for transaction history to load.
        if (transactions.length == 0) {
            log("No transactions");
            return;
        }

        // Return early if an unsupported view is active.
        if (!['Activity since last statement', 'All transactions'].includes($('#header-transactionTypeOptions').val())) {
            log("Unsupported view");
            return;
        }

        // Add Balance column.
        $('#creditCardTransTable thead tr').append('<th scope="col" class="sortable amount running-balance-ext">Balance</th>');

        // Find current balance and use it as running balance.
        var runningBalance = amountToNumber($('#accountCurrentBalance').text());

        log("Calculate and display running balance");

        // Calculate and display running balance for each transaction.
        $(transactions).each(function () {
            // Clone an Amount cell to easily create a similar-looking Balance cell.
            var balanceCell = $(this).find('td.amount').clone();
            balanceCell.addClass('running-balance-ext');
            balanceCell.find('span').text('$' + runningBalance.toLocaleString("en-US", {minimumFractionDigits: 2}));
            $(this).append(balanceCell);

            var transactionAmount = amountToNumber($(this).find('.amount').first().text());
            runningBalance -= transactionAmount;
        });
    }

    function amountToNumber(text) {
        return parseFloat(text.replace('\u2212', '-').replace(/[$,]+/g, ''));
    }

    function log(message) {
        console.info("CRB: " + message);
    }
};

var script = document.createElement('script');
script.type = "text/javascript";
script.textContent = '(' + main.toString() + ')();';
document.body.appendChild(script);