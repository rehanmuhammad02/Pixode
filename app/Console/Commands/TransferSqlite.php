<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use RuntimeException;
class TransferSqlite extends Command
{
    protected $signature = 'pixode:transfer-sqlite {source : Absolute path to the current Laravel SQLite database}';
    protected $description = 'Transfer current Laravel accounts, content and inquiries to an empty SQL Server target';
    public function handle(): int
    {
        $source = realpath($this->argument('source'));
        if (!$source || DB::connection()->getDriverName() !== 'sqlsrv') {
            $this->error('Provide an existing SQLite source and configure a SQL Server target.');
            return self::FAILURE;
        }
        $snapshot = new \PDO('sqlite:file:'.str_replace('\\', '/', $source).'?mode=ro');
        $tables = ['users', 'studio_sites', 'studio_inquiries', 'password_reset_tokens'];
        foreach ($tables as $table) {
            if (DB::table($table)->exists()) {
                $this->error('Target '.$table.' is not empty. Transfer stopped without overwriting data.');
                return self::FAILURE;
            }
        }
        $counts = [];
        DB::transaction(function () use ($snapshot, $tables, &$counts) {
            foreach ($tables as $table) {
                $rows = $snapshot->query('SELECT * FROM '.$table)->fetchAll(\PDO::FETCH_ASSOC);
                $identity = in_array($table, ['users', 'studio_sites'], true);
                if ($identity && count($rows)) DB::unprepared('SET IDENTITY_INSERT ['.$table.'] ON');
                try {
                    foreach ($rows as $row) DB::table($table)->insert($row);
                } finally {
                    if ($identity && count($rows)) DB::unprepared('SET IDENTITY_INSERT ['.$table.'] OFF');
                }
                $counts[$table] = count($rows);
                if (DB::table($table)->count() !== count($rows)) throw new RuntimeException('Transfer count mismatch: '.$table);
            }
        });
        foreach ($counts as $table => $count) $this->line($table.': '.$count.' rows verified');
        $this->info('Current Laravel data transferred. SQLite source preserved; sign in again for a new session.');
        return self::SUCCESS;
    }
}