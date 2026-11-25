<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void
    {
        if (DB::connection()->getDriverName() !== 'sqlsrv') return;
        // SQL Server otherwise permits only one NULL in a unique index.
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_username_unique');
            $table->dropUnique('users_google_id_unique');
        });
        DB::statement('CREATE UNIQUE INDEX [users_username_unique] ON [users] ([username]) WHERE [username] IS NOT NULL');
        DB::statement('CREATE UNIQUE INDEX [users_google_id_unique] ON [users] ([google_id]) WHERE [google_id] IS NOT NULL');
    }
    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'sqlsrv') return;
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_username_unique');
            $table->dropUnique('users_google_id_unique');
            $table->unique('username');
            $table->unique('google_id');
        });
    }
};