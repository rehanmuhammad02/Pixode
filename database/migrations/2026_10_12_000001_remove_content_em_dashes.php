<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
return new class extends Migration {
    public function up(): void
    {
        $clean = function ($value) use (&$clean) {
            if (is_array($value)) return array_map($clean, $value);
            if (is_string($value)) return preg_replace('/\h*[\x{2013}\x{2014}]\h*/u', ' ', $value);
            return $value;
        };
        DB::transaction(function () use ($clean) {
            foreach (DB::table('studio_sites')->lockForUpdate()->get() as $row) {
                $content = json_decode($row->content, true, 512, JSON_THROW_ON_ERROR);
                $updated = $clean($content);
                if ($updated !== $content) DB::table('studio_sites')->where('id', $row->id)->update(['content'=>json_encode($updated, JSON_THROW_ON_ERROR), 'revision'=>(int)$row->revision+1, 'updated_at'=>now()]);
            }
        });
    }
    public function down(): void {}
};