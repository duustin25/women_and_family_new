<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class TrainChatbotCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chatbot:train {--evaluate : Run model evaluation after training}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Train the Sentinel AI Chatbot NLP neural network model on production or local environment';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🤖 Initializing Sentinel Chatbot Model Training...');

        $trainScript = resource_path('python/train.py');
        $evalScript = resource_path('python/evaluate.py');

        if (!file_exists($trainScript)) {
            $this->error("Training script not found at: {$trainScript}");
            return Command::FAILURE;
        }

        $candidates = array_filter([
            config('app.python_path'),
            env('PYTHON_PATH'),
            PHP_OS_FAMILY === 'Windows' ? 'python' : 'python3',
            'python3',
            'python',
            '/usr/bin/python3',
            '/usr/local/bin/python3',
        ]);
        $candidates = array_unique($candidates);

        $pythonBinary = null;
        foreach ($candidates as $candidate) {
            try {
                $testProcess = new Process([$candidate, '--version']);
                $testProcess->run();
                if ($testProcess->isSuccessful()) {
                    $pythonBinary = $candidate;
                    break;
                }
            } catch (\Throwable $e) {
                continue;
            }
        }

        if (!$pythonBinary) {
            $this->error('Python executable not found. Please ensure Python 3 is installed and accessible in PATH or set PYTHON_PATH in .env.');
            return Command::FAILURE;
        }

        $this->line("Using Python executable: <comment>{$pythonBinary}</comment>");
        $this->line("Executing: <info>{$pythonBinary} {$trainScript}</info>");

        $process = new Process([$pythonBinary, $trainScript], base_path());
        $process->setTimeout(300.0);
        $process->run(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        if (!$process->isSuccessful()) {
            $this->error('Chatbot training failed.');
            return Command::FAILURE;
        }

        $modelPath = resource_path('python/chatbot_model.pkl');
        if (file_exists($modelPath)) {
            $size = round(filesize($modelPath) / 1024, 2);
            $this->info("✅ Training complete! Model successfully compiled to: {$modelPath} ({$size} KB)");
        } else {
            $this->warn('Training script finished, but model artifact file was not found.');
        }

        if ($this->option('evaluate') && file_exists($evalScript)) {
            $this->info("\n📊 Running Model Evaluation...");
            $evalProcess = new Process([$pythonBinary, $evalScript], base_path());
            $evalProcess->setTimeout(120.0);
            $evalProcess->run(function ($type, $buffer) {
                $this->output->write($buffer);
            });
        }

        return Command::SUCCESS;
    }
}
