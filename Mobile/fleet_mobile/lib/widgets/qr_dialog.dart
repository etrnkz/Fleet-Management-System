import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../core/theme.dart';

/// Shows a QR code dialog without freezing the UI.
/// The QR is rendered after the dialog is fully open.
void showQrDialog(
  BuildContext context, {
  required String data,
  required String title,
  String? subtitle,
  String? caption,
}) {
  showDialog(
    context: context,
    barrierDismissible: true,
    builder: (_) => _QrDialog(data: data, title: title, subtitle: subtitle, caption: caption),
  );
}

class _QrDialog extends StatefulWidget {
  final String data;
  final String title;
  final String? subtitle;
  final String? caption;
  const _QrDialog({required this.data, required this.title, this.subtitle, this.caption});

  @override
  State<_QrDialog> createState() => _QrDialogState();
}

class _QrDialogState extends State<_QrDialog> {
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    // Defer QR rendering until after the dialog animation completes
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future.delayed(const Duration(milliseconds: 150), () {
        if (mounted) setState(() => _ready = true);
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Text(widget.title, style: const TextStyle(fontWeight: FontWeight.w800)),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 232,
            height: 232,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: kBackground,
              borderRadius: BorderRadius.circular(12),
            ),
            child: _ready
                ? QrImageView(
                    data: widget.data,
                    size: 200,
                    backgroundColor: Colors.white,
                    errorStateBuilder: (_, __) => const Center(
                      child: Text('Failed to generate QR', textAlign: TextAlign.center),
                    ),
                  )
                : const Center(
                    child: CircularProgressIndicator(color: kPrimary, strokeWidth: 2),
                  ),
          ),
          if (widget.subtitle != null) ...[
            const SizedBox(height: 12),
            Text(
              widget.subtitle!,
              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
              textAlign: TextAlign.center,
            ),
          ],
          if (widget.caption != null) ...[
            const SizedBox(height: 4),
            Text(
              widget.caption!,
              style: const TextStyle(color: kTextMuted, fontSize: 12, fontFamily: 'monospace'),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Close'),
        ),
      ],
    );
  }
}
