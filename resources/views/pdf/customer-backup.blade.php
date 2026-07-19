<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $business->name }} Customer Backup</title>
    <style>
        @page { margin: 34px 38px; }
        body { font-family: DejaVu Sans, sans-serif; color: #151923; font-size: 11px; }
        .header { border-bottom: 3px solid #f8b927; padding-bottom: 18px; margin-bottom: 22px; }
        .logo { width: 175px; margin-bottom: 16px; }
        h1 { font-size: 22px; margin: 0 0 5px; }
        .meta { color: #69707d; margin: 0; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #fff5da; color: #493400; text-align: left; padding: 10px 9px; border: 1px solid #ebd9aa; }
        td { padding: 9px; border: 1px solid #e1e3e7; vertical-align: top; }
        tbody tr:nth-child(even) { background: #fafafa; }
        .number { text-align: center; width: 120px; font-weight: bold; }
        .empty { text-align: center; padding: 32px; color: #69707d; }
        .footer { margin-top: 22px; padding-top: 12px; border-top: 1px solid #e1e3e7; color: #747b87; font-size: 9px; line-height: 1.45; }
    </style>
</head>
<body>
    <div class="header">
        @if ($logoDataUri)
            <img class="logo" src="{{ $logoDataUri }}" alt="StampBayan">
        @endif
        <h1>Customer Loyalty Backup</h1>
        <p class="meta">{{ $business->name }} · Generated {{ $generatedAt->format('F j, Y \a\t g:i A') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Customer Name</th>
                <th>Loyalty Card</th>
                <th class="number">Number of Stamps</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $row)
                <tr>
                    <td>{{ $row->customer_name }}</td>
                    <td>{{ $row->loyalty_card }}</td>
                    <td class="number">{{ $row->number_of_stamps }}</td>
                </tr>
            @empty
                <tr><td colspan="3" class="empty">No customer loyalty records yet.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        This basic export is a portable summary of customer names, loyalty cards, and current stamp totals. It is not a restorable database backup. For automatic twice-daily restore points and accidental-deletion recovery, activate StampBayan Data Protection.
    </div>
</body>
</html>
